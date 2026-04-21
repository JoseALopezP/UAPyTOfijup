$inputPath = 'c:\Users\JALP4\OneDrive\Desktop\UAPyTOfijup\src\app\Listas-Desplegables\modules\listaAbogados.jsx'
$outputPath = 'c:\Users\JALP4\OneDrive\Desktop\UAPyTOfijup\src\app\Abogados\components\listaAbogadosData.js'

$content = Get-Content -Path $inputPath -Encoding UTF8
$dataLines = $content | Select-Object -Skip 1

$result = @()

foreach ($line in $dataLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    $parts = $line -split "\t"
    if ($parts.Count -lt 2) { continue }
    
    $matricula = $parts[0].Trim()
    $ayn = $parts[1].Trim()
    $tel = if ($parts.Count -gt 4) { $parts[4].Trim() } else { '' }
    $cargo = if ($parts.Count -gt 5) { $parts[5].Trim() } else { '' }
    $lugar = if ($parts.Count -gt 6) { $parts[6].Trim() } elseif ($parts.Count -gt 3) { $parts[3].Trim() } else { '' }

    # Optimized structure with short keys to save bandwidth and fit in 1MB Firestore limit
    # m: matricula, n: ayn, t: tel, c: cargo, l: lugar
    $obj = [PSCustomObject]@{
        m = $matricula
        n = $ayn
        t = $tel
        c = $cargo
        l = $lugar
    }
    $result += $obj
}

# No indentation to minimize size
$json = $result | ConvertTo-Json -Compress
"export const LISTA_ABOGADOS_INICIAL = $json;" | Out-File -FilePath $outputPath -Encoding UTF8
