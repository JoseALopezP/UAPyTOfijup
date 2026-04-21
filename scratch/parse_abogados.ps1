$inputPath = 'c:\Users\JALP4\OneDrive\Desktop\UAPyTOfijup\src\app\Listas-Desplegables\modules\listaAbogados.jsx'
$outputPath = 'c:\Users\JALP4\OneDrive\Desktop\UAPyTOfijup\src\app\Abogados\components\listaAbogadosData.js'

$content = Get-Content -Path $inputPath -Encoding UTF8
$dataLines = $content | Select-Object -Skip 1

$result = @()

foreach ($line in $dataLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    # Using tab as separator
    $parts = $line -split "\t"
    if ($parts.Count -lt 2) { continue }
    
    $matricula = $parts[0].Trim()
    $ayn = $parts[1].Trim()
    
    # Telefono is col 4 (index 4)
    $tel = ""
    if ($parts.Count -gt 4) { $tel = $parts[4].Trim() }
    
    # Cargo PJ is col 5 (index 5)
    $cargo = ""
    if ($parts.Count -gt 5) { $cargo = $parts[5].Trim() }
    
    # LUGAR is col 6 (index 6) or col 3 (Localidad)
    $lugar = ""
    if ($parts.Count -gt 6) { $lugar = $parts[6].Trim() }
    elseif ($parts.Count -gt 3) { $lugar = $parts[3].Trim() }

    # User requested: AyN, tel, cargo, lugar. 
    # And "nombre sea el numero de matricula" -> I'll include nroMatricula as a field.
    $obj = [PSCustomObject]@{
        nroMatricula = $matricula
        AyN          = $ayn
        tel          = $tel
        cargo        = $cargo
        lugar        = $lugar
    }
    $result += $obj
}

# Convert to JSON array
$json = $result | ConvertTo-Json -Depth 5
"export const LISTA_ABOGADOS_INICIAL = $json;" | Out-File -FilePath $outputPath -Encoding UTF8
