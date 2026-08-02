allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// ---------------------------------------------------------------------------
// Redirected OUTSIDE the repo on purpose: this project lives under
// "Codeamble `26", and AGP's CMake driver rejects any command-line argument
// containing a backtick ("argument had embedded tick-mark"). AGP derives
// CMAKE_LIBRARY_OUTPUT_DIRECTORY/CMAKE_RUNTIME_OUTPUT_DIRECTORY straight from
// the module's own build/intermediates path with no DSL override available,
// so the only fix is for that path to not contain the backtick at all.
// `flutter build`/`flutter run` still work normally — the tool reads the
// APK location from Gradle rather than assuming a fixed relative path.
// Revert to the stock "../../build" if the project ever moves to a plain path.
// ---------------------------------------------------------------------------
val newBuildDir: Directory =
    layout.dir(provider { File("D:/android-dev/build-out/patient-tap-android") }).get()

rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
