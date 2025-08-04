!macro customInit
  ; Check for .NET 9.0 Runtime - Multiple registry locations
  ${If} ${RunningX64}
    ; Check x64 registry
    ReadRegStr $0 HKLM "SOFTWARE\dotnet\Setup\InstalledVersions\x64\sharedfx\Microsoft.NETCore.App" "9.0.0"
    ${If} $0 == ""
      ; Check alternative registry path
      ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{A8C89B95-461D-4E18-8B78-6F302846D3A8}" "DisplayName"
      ${If} $0 == ""
        ; Check Program Files
        ${If} ${FileExists} "$PROGRAMFILES64\dotnet\shared\Microsoft.NETCore.App\9.0.0\*.*"
          ; .NET 9.0 found in Program Files
        ${Else}
          ; .NET 9.0 not found - show installation dialog
          MessageBox MB_YESNO|MB_ICONQUESTION "WE Downloader requires .NET 9.0 Runtime to function properly.$\r$\n$\r$\nWould you like to download and install .NET 9.0 Runtime now?$\r$\n$\r$\nClick YES to open the download page$\r$\nClick NO to continue installation (app may not work)" IDYES installDotNet IDNO skipDotNet
          installDotNet:
            ExecShell "open" "https://dotnet.microsoft.com/download/dotnet/thank-you/runtime-9.0.0-windows-x64-installer"
            MessageBox MB_OK|MB_ICONINFORMATION "Please install .NET 9.0 Runtime and then run this installer again.$\r$\n$\r$\nThe application will not work without .NET 9.0 Runtime."
            Abort
          skipDotNet:
            MessageBox MB_OK|MB_ICONWARNING "Installation will continue, but WE Downloader may not work without .NET 9.0 Runtime.$\r$\n$\r$\nYou can install .NET 9.0 Runtime later from:$\r$\nhttps://dotnet.microsoft.com/download/dotnet/9.0"
        ${EndIf}
      ${EndIf}
    ${EndIf}
  ${Else}
    ; Check x86 registry
    ReadRegStr $0 HKLM "SOFTWARE\dotnet\Setup\InstalledVersions\x86\sharedfx\Microsoft.NETCore.App" "9.0.0"
    ${If} $0 == ""
      ; Check alternative registry path for x86
      ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{A8C89B95-461D-4E18-8B78-6F302846D3A8}" "DisplayName"
      ${If} $0 == ""
        ; Check Program Files (x86)
        ${If} ${FileExists} "$PROGRAMFILES\dotnet\shared\Microsoft.NETCore.App\9.0.0\*.*"
          ; .NET 9.0 found in Program Files (x86)
        ${Else}
          ; .NET 9.0 not found - show installation dialog
          MessageBox MB_YESNO|MB_ICONQUESTION "WE Downloader requires .NET 9.0 Runtime to function properly.$\r$\n$\r$\nWould you like to download and install .NET 9.0 Runtime now?$\r$\n$\r$\nClick YES to open the download page$\r$\nClick NO to continue installation (app may not work)" IDYES installDotNet86 IDNO skipDotNet86
          installDotNet86:
            ExecShell "open" "https://dotnet.microsoft.com/download/dotnet/thank-you/runtime-9.0.0-windows-x86-installer"
            MessageBox MB_OK|MB_ICONINFORMATION "Please install .NET 9.0 Runtime and then run this installer again.$\r$\n$\r$\nThe application will not work without .NET 9.0 Runtime."
            Abort
          skipDotNet86:
            MessageBox MB_OK|MB_ICONWARNING "Installation will continue, but WE Downloader may not work without .NET 9.0 Runtime.$\r$\n$\r$\nYou can install .NET 9.0 Runtime later from:$\r$\nhttps://dotnet.microsoft.com/download/dotnet/9.0"
        ${EndIf}
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend