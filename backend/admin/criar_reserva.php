<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'conexao.php';

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Pegar o idioma da requisição (padrão: en)
$lang = isset($dados['lang']) ? $dados['lang'] : 'en';

// Verifica se todos os campos obrigatórios foram fornecidos
if (!isset($dados['id_quarto']) || !isset($dados['data_checkin']) || !isset($dados['data_checkout']) || 
    !isset($dados['numero_hospedes']) || !isset($dados['nome']) || !isset($dados['email']) || !isset($dados['telefone'])) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'Dados incompletos' : 'Incomplete data';
    echo json_encode(['erro' => $erro]);
    exit;
}

// Escapa os dados do hóspede
$nome = $conexao->real_escape_string($dados['nome']);
$email = $conexao->real_escape_string($dados['email']);
$telefone = $conexao->real_escape_string($dados['telefone']);
$documento = $conexao->real_escape_string($dados['documento'] ?? '');

// Verifica se o hóspede já existe
$sql = "SELECT id FROM hospedes WHERE email = '$email'";
$resultado = $conexao->query($sql);

if ($resultado->num_rows > 0) {
    // Hóspede já existe, obtém seu ID
    $row = $resultado->fetch_assoc();
    $id_hospede = $row['id'];
    
    // Atualiza os dados do hóspede
    $sql = "UPDATE hospedes SET nome = '$nome', telefone = '$telefone', documento = '$documento' WHERE id = $id_hospede";
    $conexao->query($sql);
} else {
    // Insere novo hóspede
    $sql = "INSERT INTO hospedes (nome, email, telefone, documento) VALUES ('$nome', '$email', '$telefone', '$documento')";
    $conexao->query($sql);
    $id_hospede = $conexao->insert_id;
}

// Escapa os dados da reserva
$id_quarto = intval($dados['id_quarto']);
$data_checkin = $conexao->real_escape_string($dados['data_checkin']);
$data_checkout = $conexao->real_escape_string($dados['data_checkout']);
$numero_hospedes = intval($dados['numero_hospedes']);
$observacoes = $conexao->real_escape_string($dados['observacoes'] ?? '');

// Verifica se o quarto existe e está disponível
$sql = "SELECT preco, nome FROM quartos WHERE id = $id_quarto AND status = 'disponivel'";
$resultado = $conexao->query($sql);

if ($resultado->num_rows === 0) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'Quarto não disponível ou não encontrado' : 'Room not available or not found';
    echo json_encode(['erro' => $erro]);
    exit;
}

// Obtém o preço e nome do quarto
$row = $resultado->fetch_assoc();
$preco_quarto = $row['preco'];
$nome_quarto = $row['nome'];

// Calcula o número de diárias
$data_inicio = new DateTime($data_checkin);
$data_fim = new DateTime($data_checkout);
$intervalo = $data_inicio->diff($data_fim);
$num_diarias = $intervalo->days;

if ($num_diarias < 1) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'Período de reserva inválido' : 'Invalid reservation period';
    echo json_encode(['erro' => $erro]);
    exit;
}

// Calcula o valor total
$valor_total = $preco_quarto * $num_diarias;

// Gera código único para a reserva (formato PV + 6 dígitos)
$codigo = 'PV' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

// Insere a reserva no banco de dados
$sql = "INSERT INTO reservas (codigo, id_quarto, id_hospede, data_checkin, data_checkout, numero_hospedes, valor_total, observacoes)
        VALUES ('$codigo', $id_quarto, $id_hospede, '$data_checkin', '$data_checkout', $numero_hospedes, $valor_total, '$observacoes')";

if ($conexao->query($sql) === TRUE) {
    $id_reserva = $conexao->insert_id;
    
    // Atualiza o status do quarto para ocupado
    $sql = "UPDATE quartos SET status = 'ocupado' WHERE id = $id_quarto";
    $conexao->query($sql);
    
    // Preparar e enviar a mensagem de WhatsApp
    $data_checkin_formatada = date('d/m/Y', strtotime($data_checkin));
    $data_checkout_formatada = date('d/m/Y', strtotime($data_checkout));
    
    // Template da mensagem
    if ($lang == 'pt') {
        $mensagem_whatsapp = "Olá $nome, sua reserva na PousadaViva foi confirmada!\n\n";
        $mensagem_whatsapp .= "📆 Check-in: $data_checkin_formatada\n";
        $mensagem_whatsapp .= "📆 Check-out: $data_checkout_formatada\n";
        $mensagem_whatsapp .= "🏨 Quarto: $nome_quarto\n";
        $mensagem_whatsapp .= "👥 Hóspedes: $numero_hospedes\n";
        $mensagem_whatsapp .= "💰 Valor Total: R$ $valor_total\n\n";
        $mensagem_whatsapp .= "🔑 Código de Reserva: $codigo\n\n";
        $mensagem_whatsapp .= "Estamos ansiosos para recebê-lo!";
    } else {
        $mensagem_whatsapp = "Hello $nome, your reservation at PousadaViva has been confirmed!\n\n";
        $mensagem_whatsapp .= "📆 Check-in: $data_checkin_formatada\n";
        $mensagem_whatsapp .= "📆 Check-out: $data_checkout_formatada\n";
        $mensagem_whatsapp .= "🏨 Room: $nome_quarto\n";
        $mensagem_whatsapp .= "👥 Guests: $numero_hospedes\n";
        $mensagem_whatsapp .= "💰 Total Amount: $ $valor_total\n\n";
        $mensagem_whatsapp .= "🔑 Reservation Code: $codigo\n\n";
        $mensagem_whatsapp .= "We look forward to welcoming you!";
    }
    
    // Dados para a API de WhatsApp
    $whatsapp_data = [
        'telefone' => $telefone,
        'mensagem' => $mensagem_whatsapp,
        'id_reserva' => $id_reserva,
        'lang' => $lang
    ];
    
    // Realizar solicitação interna para o envio de WhatsApp
    $ch = curl_init('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/enviar_whatsapp.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($whatsapp_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $whatsapp_response = curl_exec($ch);
    curl_close($ch);
    
    // Decodificar a resposta do WhatsApp
    $whatsapp_result = json_decode($whatsapp_response, true);
    
    $mensagem_sucesso = $lang == 'pt' ? 'Reserva criada com sucesso' : 'Reservation created successfully';
    
    echo json_encode([
        'sucesso' => true, 
        'id' => $id_reserva, 
        'codigo' => $codigo,
        'valor_total' => $valor_total,
        'mensagem' => $mensagem_sucesso,
        'whatsapp_url' => $whatsapp_result['url'] ?? null
    ]);
} else {
    http_response_code(500);
    $erro = $lang == 'pt' ? 'Erro ao criar reserva: ' . $conexao->error : 'Error creating reservation: ' . $conexao->error;
    echo json_encode(['erro' => $erro]);
}

$conexao->close();
?>
