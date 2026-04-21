$inputPath = 'c:\Users\JALP4\OneDrive\Desktop\UAPyTOfijup\src\app\Listas-Desplegables\modules\listaAbogados.jsx'
$outputPath = 'c:\Users\JALP4\OneDrive\Desktop\UAPyTOfijup\src\app\Abogados\components\listaAbogadosData.js'

$content = Get-Content -Path $inputPath -Encoding UTF8
$dataLines = $content | Select-Object -Skip 1

$result = @()
$blackList = @("FUNCION PUBLICA", "PASIVIDAD", "S / N", "---", "PASIVIDAD PASIVIDAD", "FUNCION PUBLICA FUNCION PUBLICA")

foreach ($line in $dataLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    $parts = $line -split "\t"
    if ($parts.Count -lt 2) { continue }
    
    $matricula = $parts[0].Trim()
    $ayn = $parts[1].Trim()
    
    # Validation of generic name
    if ($blackList -contains $ayn.ToUpper()) { $ayn = "" }
    if ([string]::IsNullOrWhiteSpace($ayn)) { continue }

    $obj = [PSCustomObject]@{
        m = $matricula
        n = $ayn
    }

    # Telefono
    if ($parts.Count -gt 4) {
        $tel = $parts[4].Trim()
        if (![string]::IsNullOrWhiteSpace($tel) -and !($blackList -contains $tel.ToUpper())) {
            $obj | Add-Member -MemberType NoteProperty -Name "t" -Value $tel
        }
    }

    # Cargo
    if ($parts.Count -gt 5) {
        $cargo = $parts[5].Trim()
        if (![string]::IsNullOrWhiteSpace($cargo) -and !($blackList -contains $cargo.ToUpper())) {
            $obj | Add-Member -MemberType NoteProperty -Name "c" -Value $cargo
        }
    }

    # Lugar
    if ($parts.Count -gt 6) {
        $lugar = $parts[6].Trim()
        if (![string]::IsNullOrWhiteSpace($lugar) -and !($blackList -contains $lugar.ToUpper())) {
            $obj | Add-Member -MemberType NoteProperty -Name "l" -Value $lugar
        }
    }

    $result += $obj
}

$json = $result | ConvertTo-Json -Compress
"export const LISTA_ABOGADOS_INICIAL = $json;" | Out-File -FilePath $outputPath -Encoding UTF8
