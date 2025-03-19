!macro customInit
  ; Check for .NET 9.0 Runtime
  ReadRegStr $0 HKLM "SOFTWARE\dotnet\Setup\InstalledVersions\x64\sharedfx\Microsoft.NETCore.App" "9.0.0"
  ${If} $0 == ""
    MessageBox MB_YESNO "This application requires .NET 9.0 Runtime. Would you like to download and install it now?" IDYES installDotNet IDNO skipDotNet
    installDotNet:
      ExecShell "open" "https://dotnet.microsoft.com/download/dotnet/thank-you/runtime-9.0.0-windows-x64-installer"
      MessageBox MB_OK "Please install .NET 9.0 Runtime and then run the installer again."
      Abort
    skipDotNet:
      MessageBox MB_OK "The application may not work correctly without .NET 9.0 Runtime."
  ${EndIf}
!macroend