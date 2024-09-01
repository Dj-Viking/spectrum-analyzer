param(

)

try {
    Start-Process node ".\node_modules\typescript\bin\tsc -b ." -WindowStyle Minimized;

    Copy-Item ./app/index.html ./dist/app/;

    Start-Process node ".\server.js" -WindowStyle Normal;
}
catch {
    throw $_;
}