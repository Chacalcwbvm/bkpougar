
<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    if (!$dados || empty($dados['tipo']) || empty($dados['dataInicio']) || empty($dados['dataFim'])) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Dados incompletos para gerar relatório'
        ]);
        exit;
    }
    
    $tipo = $conexao->real_escape_string($dados['tipo']);
    $dataInicio = $conexao->real_escape_string($dados['dataInicio']);
    $dataFim = $conexao->real_escape_string($dados['dataFim']);
    $hotelName = $conexao->real_escape_string($dados['hotelName'] ?? 'PousadaViva');
    $logoUrl = $conexao->real_escape_string($dados['logoUrl'] ?? '');
    $currency = $conexao->real_escape_string($dados['currency'] ?? 'USD');
    
    // Verificar se a tabela financeiro existe
    $check = $conexao->query("SHOW TABLES LIKE 'financeiro'");
    if ($check->num_rows == 0) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Tabela de finanças não encontrada'
        ]);
        exit;
    }
    
    // Diretório para salvar relatórios
    $reports_dir = '../relatorios/';
    if (!file_exists($reports_dir)) {
        mkdir($reports_dir, 0777, true);
    }
    
    // Gerar nome do arquivo
    $timestamp = date('YmdHis');
    $filename = "relatorio_{$tipo}_{$timestamp}.html";
    $filepath = $reports_dir . $filename;
    
    // Cabeçalho e estilo do relatório
    $html = '<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Financeiro - ' . htmlspecialchars($hotelName) . '</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6;
                color: #333;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20px;
            }
            .header, .footer {
                text-align: center;
                margin-bottom: 20px;
                padding: 10px;
                border-bottom: 1px solid #ddd;
            }
            .logo { 
                max-height: 60px; 
                margin-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .summary {
                margin-top: 20px;
                padding: 10px;
                background-color: #f2f2f2;
                border-radius: 5px;
            }
            @media print {
                body { margin: 0; padding: 15px; }
                button { display: none; }
            }
            .print-btn {
                background-color: #4CAF50;
                color: white;
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777;
                border-top: 1px solid #ddd;
                border-bottom: none;
            }
        </style>
    </head>
    <body>
        <div class="header">
            ' . ($logoUrl ? '<img src="' . htmlspecialchars($logoUrl) . '" alt="Logo" class="logo">' : '') . '
            <h1>' . htmlspecialchars($hotelName) . ' - Relatório Financeiro</h1>
            <p>Período: ' . date('d/m/Y', strtotime($dataInicio)) . ' até ' . date('d/m/Y', strtotime($dataFim)) . '</p>
        </div>';
    
    // Conteúdo do relatório com base no tipo
    switch ($tipo) {
        case 'monthly':
            $sql = "SELECT 
                    DATE_FORMAT(data_transacao, '%m/%Y') as mes,
                    SUM(CASE WHEN tipo = 'payment' OR tipo = 'deposit' THEN valor ELSE 0 END) as receitas,
                    SUM(CASE WHEN tipo = 'expense' OR tipo = 'refund' THEN valor ELSE 0 END) as despesas,
                    SUM(CASE WHEN tipo = 'payment' OR tipo = 'deposit' THEN valor ELSE -valor END) as saldo
                FROM financeiro
                WHERE data_transacao BETWEEN '$dataInicio' AND '$dataFim 23:59:59'
                GROUP BY DATE_FORMAT(data_transacao, '%m/%Y')
                ORDER BY DATE_FORMAT(data_transacao, '%Y-%m')";
            
            $resultado = $conexao->query($sql);
            
            $html .= '<h2>Relatório Mensal</h2>';
            
            if ($resultado && $resultado->num_rows > 0) {
                $html .= '<table>
                    <tr>
                        <th>Mês</th>
                        <th>Receitas</th>
                        <th>Despesas</th>
                        <th>Saldo</th>
                    </tr>';
                
                $total_receitas = 0;
                $total_despesas = 0;
                $total_saldo = 0;
                
                while ($row = $resultado->fetch_assoc()) {
                    $receitas = floatval($row['receitas']);
                    $despesas = floatval($row['despesas']);
                    $saldo = floatval($row['saldo']);
                    
                    $total_receitas += $receitas;
                    $total_despesas += $despesas;
                    $total_saldo += $saldo;
                    
                    $html .= '<tr>
                        <td>' . $row['mes'] . '</td>
                        <td>' . $currency . ' ' . number_format($receitas, 2, ',', '.') . '</td>
                        <td>' . $currency . ' ' . number_format($despesas, 2, ',', '.') . '</td>
                        <td>' . $currency . ' ' . number_format($saldo, 2, ',', '.') . '</td>
                    </tr>';
                }
                
                $html .= '<tr>
                    <th>Total</th>
                    <th>' . $currency . ' ' . number_format($total_receitas, 2, ',', '.') . '</th>
                    <th>' . $currency . ' ' . number_format($total_despesas, 2, ',', '.') . '</th>
                    <th>' . $currency . ' ' . number_format($total_saldo, 2, ',', '.') . '</th>
                </tr>';
                
                $html .= '</table>';
                
                $html .= '<div class="summary">
                    <h3>Resumo do Período</h3>
                    <p>Total de Receitas: ' . $currency . ' ' . number_format($total_receitas, 2, ',', '.') . '</p>
                    <p>Total de Despesas: ' . $currency . ' ' . number_format($total_despesas, 2, ',', '.') . '</p>
                    <p>Saldo Final: ' . $currency . ' ' . number_format($total_saldo, 2, ',', '.') . '</p>
                </div>';
            } else {
                $html .= '<p>Nenhum dado financeiro encontrado para o período selecionado.</p>';
            }
            break;
        
        case 'transactions':
            $sql = "SELECT 
                    id, 
                    id_reserva, 
                    tipo, 
                    valor, 
                    descricao, 
                    data_transacao 
                FROM financeiro
                WHERE data_transacao BETWEEN '$dataInicio' AND '$dataFim 23:59:59'
                ORDER BY data_transacao DESC";
            
            $resultado = $conexao->query($sql);
            
            $html .= '<h2>Relatório de Transações</h2>';
            
            if ($resultado && $resultado->num_rows > 0) {
                $html .= '<table>
                    <tr>
                        <th>ID</th>
                        <th>Reserva</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Descrição</th>
                        <th>Data</th>
                    </tr>';
                
                $total_entradas = 0;
                $total_saidas = 0;
                
                while ($row = $resultado->fetch_assoc()) {
                    $valor = floatval($row['valor']);
                    $tipo_display = '';
                    
                    switch($row['tipo']) {
                        case 'payment':
                            $tipo_display = 'Pagamento';
                            $total_entradas += $valor;
                            break;
                        case 'expense':
                            $tipo_display = 'Despesa';
                            $total_saidas += $valor;
                            break;
                        case 'deposit':
                            $tipo_display = 'Depósito';
                            $total_entradas += $valor;
                            break;
                        case 'refund':
                            $tipo_display = 'Reembolso';
                            $total_saidas += $valor;
                            break;
                        default:
                            $tipo_display = ucfirst($row['tipo']);
                    }
                    
                    $html .= '<tr>
                        <td>' . $row['id'] . '</td>
                        <td>' . ($row['id_reserva'] ? $row['id_reserva'] : '-') . '</td>
                        <td>' . $tipo_display . '</td>
                        <td>' . $currency . ' ' . number_format($valor, 2, ',', '.') . '</td>
                        <td>' . htmlspecialchars($row['descricao']) . '</td>
                        <td>' . date('d/m/Y H:i', strtotime($row['data_transacao'])) . '</td>
                    </tr>';
                }
                
                $html .= '</table>';
                
                $saldo = $total_entradas - $total_saidas;
                
                $html .= '<div class="summary">
                    <h3>Resumo das Transações</h3>
                    <p>Total de Entradas: ' . $currency . ' ' . number_format($total_entradas, 2, ',', '.') . '</p>
                    <p>Total de Saídas: ' . $currency . ' ' . number_format($total_saidas, 2, ',', '.') . '</p>
                    <p>Saldo: ' . $currency . ' ' . number_format($saldo, 2, ',', '.') . '</p>
                </div>';
            } else {
                $html .= '<p>Nenhuma transação encontrada para o período selecionado.</p>';
            }
            break;
        
        case 'reservations':
            $sql = "SELECT 
                    r.id, 
                    r.nome_hospede, 
                    r.data_checkin, 
                    r.data_checkout, 
                    r.valor_total, 
                    r.valor_pago, 
                    r.status_pagamento,
                    q.nome as quarto
                FROM reservas r
                LEFT JOIN quartos q ON r.id_quarto = q.id
                WHERE r.data_checkin BETWEEN '$dataInicio' AND '$dataFim'
                   OR r.data_checkout BETWEEN '$dataInicio' AND '$dataFim'
                ORDER BY r.data_checkin";
            
            $resultado = $conexao->query($sql);
            
            $html .= '<h2>Relatório de Reservas</h2>';
            
            if ($resultado && $resultado->num_rows > 0) {
                $html .= '<table>
                    <tr>
                        <th>ID</th>
                        <th>Hóspede</th>
                        <th>Quarto</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Valor Total</th>
                        <th>Valor Pago</th>
                        <th>Status</th>
                    </tr>';
                
                $total_valor = 0;
                $total_pago = 0;
                $total_pendente = 0;
                
                while ($row = $resultado->fetch_assoc()) {
                    $valor_total = floatval($row['valor_total']);
                    $valor_pago = floatval($row['valor_pago'] ?? 0);
                    $valor_pendente = $valor_total - $valor_pago;
                    
                    $total_valor += $valor_total;
                    $total_pago += $valor_pago;
                    $total_pendente += $valor_pendente;
                    
                    $status = '';
                    switch($row['status_pagamento']) {
                        case 'pago':
                            $status = 'Pago';
                            break;
                        case 'parcial':
                            $status = 'Pago Parcialmente';
                            break;
                        case 'pendente':
                            $status = 'Pendente';
                            break;
                        default:
                            $status = ucfirst($row['status_pagamento'] ?? 'Pendente');
                    }
                    
                    $html .= '<tr>
                        <td>' . $row['id'] . '</td>
                        <td>' . htmlspecialchars($row['nome_hospede']) . '</td>
                        <td>' . htmlspecialchars($row['quarto']) . '</td>
                        <td>' . date('d/m/Y', strtotime($row['data_checkin'])) . '</td>
                        <td>' . date('d/m/Y', strtotime($row['data_checkout'])) . '</td>
                        <td>' . $currency . ' ' . number_format($valor_total, 2, ',', '.') . '</td>
                        <td>' . $currency . ' ' . number_format($valor_pago, 2, ',', '.') . '</td>
                        <td>' . $status . '</td>
                    </tr>';
                }
                
                $html .= '</table>';
                
                $html .= '<div class="summary">
                    <h3>Resumo das Reservas</h3>
                    <p>Valor Total das Reservas: ' . $currency . ' ' . number_format($total_valor, 2, ',', '.') . '</p>
                    <p>Valor Total Pago: ' . $currency . ' ' . number_format($total_pago, 2, ',', '.') . '</p>
                    <p>Valor Total Pendente: ' . $currency . ' ' . number_format($total_pendente, 2, ',', '.') . '</p>
                </div>';
            } else {
                $html .= '<p>Nenhuma reserva encontrada para o período selecionado.</p>';
            }
            break;
        
        case 'summary':
            // Totais de receitas e despesas
            $sql_financeiro = "SELECT 
                    SUM(CASE WHEN tipo = 'payment' OR tipo = 'deposit' THEN valor ELSE 0 END) as total_entradas,
                    SUM(CASE WHEN tipo = 'expense' OR tipo = 'refund' THEN valor ELSE 0 END) as total_saidas
                FROM financeiro
                WHERE data_transacao BETWEEN '$dataInicio' AND '$dataFim 23:59:59'";
            
            $resultado_financeiro = $conexao->query($sql_financeiro);
            $dados_financeiros = $resultado_financeiro ? $resultado_financeiro->fetch_assoc() : null;
            
            // Totais de reservas
            $sql_reservas = "SELECT 
                    COUNT(*) as total_reservas,
                    SUM(valor_total) as valor_total_reservas,
                    SUM(valor_pago) as valor_pago_reservas
                FROM reservas
                WHERE data_checkin BETWEEN '$dataInicio' AND '$dataFim'
                   OR data_checkout BETWEEN '$dataInicio' AND '$dataFim'";
            
            $resultado_reservas = $conexao->query($sql_reservas);
            $dados_reservas = $resultado_reservas ? $resultado_reservas->fetch_assoc() : null;
            
            $html .= '<h2>Resumo Financeiro</h2>';
            
            $html .= '<div class="summary">
                <h3>Financeiro</h3>
                <p>Total de Entradas: ' . $currency . ' ' . number_format(floatval($dados_financeiros['total_entradas'] ?? 0), 2, ',', '.') . '</p>
                <p>Total de Saídas: ' . $currency . ' ' . number_format(floatval($dados_financeiros['total_saidas'] ?? 0), 2, ',', '.') . '</p>
                <p>Saldo: ' . $currency . ' ' . number_format(floatval(($dados_financeiros['total_entradas'] ?? 0) - ($dados_financeiros['total_saidas'] ?? 0)), 2, ',', '.') . '</p>
            </div>';
            
            $html .= '<div class="summary">
                <h3>Reservas</h3>
                <p>Total de Reservas: ' . intval($dados_reservas['total_reservas'] ?? 0) . '</p>
                <p>Valor Total das Reservas: ' . $currency . ' ' . number_format(floatval($dados_reservas['valor_total_reservas'] ?? 0), 2, ',', '.') . '</p>
                <p>Valor Total Pago: ' . $currency . ' ' . number_format(floatval($dados_reservas['valor_pago_reservas'] ?? 0), 2, ',', '.') . '</p>
                <p>Valor Total Pendente: ' . $currency . ' ' . number_format(floatval(($dados_reservas['valor_total_reservas'] ?? 0) - ($dados_reservas['valor_pago_reservas'] ?? 0)), 2, ',', '.') . '</p>
            </div>';
            break;
        
        default:
            $html .= '<p>Tipo de relatório não suportado.</p>';
    }
    
    // Rodapé do relatório
    $html .= '<div class="footer">
            <p>Relatório gerado em ' . date('d/m/Y H:i:s') . '</p>
            <p>' . htmlspecialchars($hotelName) . ' - Todos os direitos reservados.</p>
        </div>
        <button class="print-btn" onclick="window.print()">Imprimir Relatório</button>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                // Auto print for PDF generation if needed
            });
        </script>
    </body>
    </html>';
    
    // Salvar o arquivo HTML
    if (file_put_contents($filepath, $html) !== false) {
        // Registrar o relatório no banco de dados
        $nome_relatorio = "Relatório " . ucfirst($tipo) . " - " . date('d/m/Y', strtotime($dataInicio)) . " a " . date('d/m/Y', strtotime($dataFim));
        $caminho = $filename;
        
        // Verificar se a tabela existe
        $check = $conexao->query("SHOW TABLES LIKE 'relatorios'");
        if ($check->num_rows == 0) {
            // Criar tabela se não existir
            $sql_create = "CREATE TABLE relatorios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                caminho VARCHAR(255) NOT NULL,
                data_inicio DATE NOT NULL,
                data_fim DATE NOT NULL,
                data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            $conexao->query($sql_create);
        }
        
        $sql_insert = "INSERT INTO relatorios (nome, tipo, caminho, data_inicio, data_fim)
                      VALUES ('$nome_relatorio', '$tipo', '$caminho', '$dataInicio', '$dataFim')";
        $conexao->query($sql_insert);
        
        echo json_encode([
            'sucesso' => true,
            'reportUrl' => '../relatorios/' . $filename,
            'reportName' => $nome_relatorio
        ]);
    } else {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Erro ao salvar o relatório'
        ]);
    }
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
}

$conexao->close();
?>
