param(
    [ValidateRange(1, 65535)]
    [int]$Port = 0
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Error "Python's Windows launcher ('py') is required but was not found."
    exit 1
}

if ($Port -eq 0) {
    $listener = [System.Net.Sockets.TcpListener]::new(
        [System.Net.IPAddress]::Loopback,
        0
    )
    $listener.Start()
    $Port = $listener.LocalEndpoint.Port
    $listener.Stop()
}

$url = "http://127.0.0.1:$Port/"
$server = $null

try {
    $server = Start-Process -FilePath "py" `
        -ArgumentList @("-m", "http.server", $Port, "--bind", "127.0.0.1") `
        -WorkingDirectory $projectRoot `
        -NoNewWindow `
        -PassThru

    $ready = $false
    for ($attempt = 0; $attempt -lt 50; $attempt++) {
        if ($server.HasExited) {
            throw "The local web server stopped before it was ready."
        }

        try {
            $connection = [System.Net.Sockets.TcpClient]::new()
            $connection.Connect("127.0.0.1", $Port)
            $connection.Dispose()
            $ready = $true
            break
        }
        catch {
            Start-Sleep -Milliseconds 100
        }
    }

    if (-not $ready) {
        throw "The local web server did not start at $url."
    }

    Write-Host "Emotion Wheel is running at $url"
    Write-Host "Press Ctrl+C or close this window to stop the server."
    Start-Process $url
    Wait-Process -Id $server.Id
}
finally {
    if ($null -ne $server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id -Force
    }
}
