import 'dart:convert';
import 'dart:typed_data';

/// Minimal protobuf wire-format primitives (varint / length-delimited /
/// fixed64), hand-written to match the real protobuf encoding exactly.
///
/// This exists because this environment has no `protoc` compiler available.
/// [ProtoWriter]/[ProtoReader] intentionally implement nothing more than the
/// wire types actually used by `proto/patient_tap.proto` (varint, string,
/// length-delimited submessage, fixed64 double). Byte output is identical to
/// what real protoc-generated code + the `protobuf` package would produce, so
/// once `protoc` is available, generated `.pb.dart` classes can replace the
/// message classes in `patient_profile.pb.dart` with no wire-format changes
/// and no changes to any caller.
library proto_wire;

const int _wireVarint = 0;
const int _wireFixed64 = 1;
const int _wireLengthDelimited = 2;

int _tag(int fieldNumber, int wireType) => (fieldNumber << 3) | wireType;

class ProtoWriter {
  final BytesBuilder _buf = BytesBuilder();

  Uint8List toBytes() => _buf.toBytes();

  void _writeVarint(int value) {
    // Values here are always non-negative (lengths, timestamps, enum
    // indices, bool 0/1), so plain unsigned LEB128 is sufficient.
    var v = value;
    while (true) {
      final byte = v & 0x7F;
      v >>= 7;
      if (v == 0) {
        _buf.addByte(byte);
        break;
      } else {
        _buf.addByte(byte | 0x80);
      }
    }
  }

  void writeString(int fieldNumber, String value) {
    if (value.isEmpty) return; // proto3 implicit presence: default = omitted
    final bytes = utf8.encode(value);
    _buf.addByte(_tag(fieldNumber, _wireLengthDelimited));
    _writeVarint(bytes.length);
    _buf.add(bytes);
  }

  void writeBool(int fieldNumber, bool value) {
    if (!value) return; // default false = omitted
    _buf.addByte(_tag(fieldNumber, _wireVarint));
    _writeVarint(1);
  }

  void writeEnum(int fieldNumber, int value) {
    if (value == 0) return; // default enum(0) = omitted
    _buf.addByte(_tag(fieldNumber, _wireVarint));
    _writeVarint(value);
  }

  void writeInt64(int fieldNumber, int value) {
    if (value == 0) return; // default 0 = omitted
    _buf.addByte(_tag(fieldNumber, _wireVarint));
    _writeVarint(value);
  }

  void writeDouble(int fieldNumber, double value) {
    if (value == 0.0) return; // default 0.0 = omitted
    _buf.addByte(_tag(fieldNumber, _wireFixed64));
    final bd = ByteData(8)..setFloat64(0, value, Endian.little);
    _buf.add(bd.buffer.asUint8List());
  }

  void writeMessage(int fieldNumber, Uint8List messageBytes) {
    // Repeated-message semantics: caller decides whether to emit for empty
    // sub-messages; here we always emit what's passed (used for repeated
    // fields where each entry is meaningful even if individual sub-fields
    // are default).
    _buf.addByte(_tag(fieldNumber, _wireLengthDelimited));
    _writeVarint(messageBytes.length);
    _buf.add(messageBytes);
  }
}

class _RawField {
  _RawField(this.fieldNumber, this.wireType, this.value);
  final int fieldNumber;
  final int wireType;
  final dynamic value; // int (varint/fixed64-as-bits) or Uint8List (LD)
}

/// Parses a buffer into raw (fieldNumber -> value) entries. Repeated fields
/// simply appear multiple times in [fields]; callers filter by fieldNumber.
class ProtoReader {
  ProtoReader(this._bytes);
  final Uint8List _bytes;
  int _offset = 0;

  int _readVarint() {
    int result = 0;
    int shift = 0;
    while (true) {
      final byte = _bytes[_offset++];
      result |= (byte & 0x7F) << shift;
      if ((byte & 0x80) == 0) break;
      shift += 7;
    }
    return result;
  }

  List<_RawField> _parseAll() {
    final out = <_RawField>[];
    while (_offset < _bytes.length) {
      final tag = _readVarint();
      final fieldNumber = tag >> 3;
      final wireType = tag & 0x7;
      switch (wireType) {
        case _wireVarint:
          out.add(_RawField(fieldNumber, wireType, _readVarint()));
          break;
        case _wireFixed64:
          final bd = ByteData.sublistView(_bytes, _offset, _offset + 8);
          _offset += 8;
          out.add(_RawField(fieldNumber, wireType, bd));
          break;
        case _wireLengthDelimited:
          final len = _readVarint();
          final slice = Uint8List.sublistView(_bytes, _offset, _offset + len);
          _offset += len;
          out.add(_RawField(fieldNumber, wireType, slice));
          break;
        default:
          // Unknown/unsupported wire type: nothing else is used by this
          // schema, so stop parsing defensively rather than misreading.
          return out;
      }
    }
    return out;
  }

  /// Returns the last occurrence of a scalar field (matches proto3 "last one
  /// wins" semantics for non-repeated fields), or [defaultValue] if absent.
  String getString(int fieldNumber, {String defaultValue = ''}) {
    for (final f in _parseAll().reversed) {
      if (f.fieldNumber == fieldNumber && f.value is Uint8List) {
        return utf8.decode(f.value as Uint8List);
      }
    }
    return defaultValue;
  }

  bool getBool(int fieldNumber, {bool defaultValue = false}) {
    for (final f in _parseAll().reversed) {
      if (f.fieldNumber == fieldNumber && f.value is int) {
        return (f.value as int) != 0;
      }
    }
    return defaultValue;
  }

  int getEnum(int fieldNumber, {int defaultValue = 0}) {
    for (final f in _parseAll().reversed) {
      if (f.fieldNumber == fieldNumber && f.value is int) {
        return f.value as int;
      }
    }
    return defaultValue;
  }

  int getInt64(int fieldNumber, {int defaultValue = 0}) {
    for (final f in _parseAll().reversed) {
      if (f.fieldNumber == fieldNumber && f.value is int) {
        return f.value as int;
      }
    }
    return defaultValue;
  }

  double getDouble(int fieldNumber, {double defaultValue = 0.0}) {
    for (final f in _parseAll().reversed) {
      if (f.fieldNumber == fieldNumber && f.value is ByteData) {
        return (f.value as ByteData).getFloat64(0, Endian.little);
      }
    }
    return defaultValue;
  }

  /// Returns raw bytes of every occurrence of a length-delimited field, in
  /// wire order — used for repeated string / repeated submessage fields.
  List<Uint8List> getRepeatedBytes(int fieldNumber) {
    return _parseAll()
        .where((f) => f.fieldNumber == fieldNumber && f.value is Uint8List)
        .map((f) => f.value as Uint8List)
        .toList();
  }

  List<String> getRepeatedString(int fieldNumber) {
    return getRepeatedBytes(fieldNumber).map(utf8.decode).toList();
  }
}
