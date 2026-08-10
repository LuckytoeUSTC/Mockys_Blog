$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

# --serve 会先构建再启动实时预览，无需重复构建一次。
node .\quartz\bootstrap-cli.mjs build --serve

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Quartz 预览启动失败，请查看上方报错。" -ForegroundColor Red
  Read-Host "按 Enter 关闭窗口"
}
