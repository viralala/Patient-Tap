/// An emergency contact. Maps to the `ContactRef` protobuf message.
///
/// Also used as the `Contact` argument for [alert_service.sendAlert].
class ContactRef {
  const ContactRef({
    required this.name,
    required this.phone,
    this.relation = '',
  });

  final String name; // e.g. "Priya Trivedi"
  final String phone; // e.g. "+91 98765 43210"
  final String relation; // e.g. "Spouse" (optional)

  ContactRef copyWith({String? name, String? phone, String? relation}) {
    return ContactRef(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      relation: relation ?? this.relation,
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'phone': phone,
        'relation': relation,
      };

  factory ContactRef.fromMap(Map<String, dynamic> map) => ContactRef(
        name: (map['name'] ?? '') as String,
        phone: (map['phone'] ?? '') as String,
        relation: (map['relation'] ?? '') as String,
      );
}
