try {
    $ErrorActionPreference = 'SilentlyContinue'
    Stop-Process -name node;
}
catch {
    <#Do this if a terminating exception happens#>
}