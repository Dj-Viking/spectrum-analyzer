param(

)

try {
    Start-Process node ".\node_modules\typescript\bin\tsc -b . -w" -WindowStyle Minimized;

    Copy-Item ./app/index.html ./dist/app/;

    Start-Process node ".\server.mjs" -WindowStyle Normal;
}
catch {
    throw $_;
}