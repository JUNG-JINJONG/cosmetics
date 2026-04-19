$csvPath = "e:\Cosmetics-B2B\data\OpenData_CosmeticSaleProductInfoC20260324.csv"
$sqlPath = "e:\Cosmetics-B2B\data\import-companies.sql"

$data = Import-Csv -Path $csvPath -Encoding UTF8
$headers = $data[0].psobject.Properties.Name

# Define Korean strings as byte arrays to avoid encoding issues of the script itself
$mfgLabel = [System.Text.Encoding]::UTF8.GetString([byte[]](0xEC, 0xA0, 0x9C, 0xEC, 0xA1, 0xB0, 0xEC, 0x82, 0xAC, 0x28, 0x4F, 0x45, 0x4D, 0x2F, 0x4F, 0x44, 0x4D, 0x29))
$brandLabel = [System.Text.Encoding]::UTF8.GetString([byte[]](0xEB, 0xB8, 0x8C, 0xEB, 0x9E, 0x9C, 0xEB, 0x93, 0x9C, 0xEC, 0x82, 0xAC))

$sw = New-Object System.IO.StreamWriter($sqlPath, $false, [System.Text.Encoding]::UTF8)
$sw.WriteLine("-- Company data import from CSV")
$sw.WriteLine("BEGIN;")

foreach ($row in $data) {
    if (-not $row.$($headers[6])) { continue }
    
    $name = $row.$($headers[0]) -replace "'", "''"
    $bizNum = $row.$($headers[6])
    $ceo = $row.$($headers[3]) -replace "'", "''"
    $addr = $row.$($headers[5]) -replace "'", "''"
    $typeRaw = $row.$($headers[2])
    
    $type = $mfgLabel
    if ($typeRaw -match [System.Text.Encoding]::UTF8.GetString([byte[]](0xEC, 0xB1, 0x8D, 0xEC, 0x9E, 0x84, 0xED, 0x8C, 0x90, 0xEB, 0xA7, 0xA4))) { # 책임판매
        $type = $brandLabel
    }
    
    $sql = "INSERT INTO company (company_name, business_number, ceo_name, factory_address, company_type) VALUES ('$name', '$bizNum', '$ceo', '$addr', '$type') ON CONFLICT (business_number) DO NOTHING;"
    $sw.WriteLine($sql)
}

$sw.WriteLine("COMMIT;")
$sw.Close()
Write-Host "Done"
