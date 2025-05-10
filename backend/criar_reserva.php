
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexao.php';

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verificar se dados JSON são válidos
if ($dados === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['erro' => 'JSON inválido: ' . json_last_error_msg()]);
    exit;
}

// Log dos dados recebidos
error_log("Dados recebidos: " . print_r($dados, true));

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

// Verificar disponibilidade do quarto antes de criar a reserva
$id_quarto = intval($dados['id_quarto']);
$data_checkin = $conexao->real_escape_string($dados['data_checkin']);
$data_checkout = $conexao->real_escape_string($dados['data_checkout']);

$check_availability = $conexao->query("
    SELECT COUNT(*) as count FROM reservas 
    WHERE id_quarto = $id_quarto 
    AND status != 'cancelada'
    AND (
        (data_checkin <= '$data_checkin' AND data_checkout > '$data_checkin')
        OR (data_checkin < '$data_checkout' AND data_checkout >= '$data_checkout')
        OR ('$data_checkin' <= data_checkin AND '$data_checkout' > data_checkin)
    )
");

$availability_result = $check_availability->fetch_assoc();
if ($availability_result['count'] > 0) {
    http_response_code(409);
    $erro = $lang == 'pt' ? 'Quarto não disponível para este período' : 'Room not available for this period';
    echo json_encode(['erro' => $erro, 'disponivel' => false]);
    exit;
}

// Criar tabela hospedes se não existir
$check_table = $conexao->query("SHOW TABLES LIKE 'hospedes'");
if ($check_table->num_rows == 0) {
    $sql_create_table = "CREATE TABLE hospedes (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        documento VARCHAR(20),
        nacionalidade VARCHAR(50),
        data_nascimento DATE,
        endereco TEXT,
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conexao->query($sql_create_table);
}

// Verifica se o hóspede já existe
$sql = "SELECT id FROM hospedes WHERE email = '$email'";
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    // Hóspede já existe, obtém seu ID
    $row = $resultado->fetch_assoc();
    $id_hospede = $row['id'];
    
    // Atualiza os dados do hóspede
    $sql = "UPDATE hospedes SET nome = '$nome', telefone = '$telefone', documento = '$documento' WHERE id = $id_hospede";
    $conexao->query($sql);
} else {
    // Insere novo hóspede
    $sql = "INSERT INTO hospedes (nome, email, telefone, documento) VALUES ('$nome', '$email', '$telefone', '$documento')";
    if (!$conexao->query($sql)) {
        error_log("Erro ao inserir hospede: " . $conexao->error);
        http_response_code(500);
        $erro = $lang == 'pt' ? 'Erro ao cadastrar hóspede: ' . $conexao->error : 'Error registering guest: ' . $conexao->error;
        echo json_encode(['erro' => $erro]);
        exit;
    }
    $id_hospede = $conexao->insert_id;
}

// Criar tabela reservas se não existir
$check_table = $conexao->query("SHOW TABLES LIKE 'reservas'");
if ($check_table->num_rows == 0) {
    $sql_create_table = "CREATE TABLE reservas (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL,
        id_quarto INT(11) NOT NULL,
        id_hospede INT(11) NOT NULL,
        data_checkin DATE NOT NULL,
        data_checkout DATE NOT NULL,
        numero_hospedes INT(2) NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        valor_pago DECIMAL(10,2) DEFAULT 0,
        status_pagamento VARCHAR(20) DEFAULT 'pendente',
        observacoes TEXT,
        status VARCHAR(20) DEFAULT 'confirmada',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conexao->query($sql_create_table);
}

// Escapa os dados da reserva
$numero_hospedes = intval($dados['numero_hospedes']);
$observacoes = $conexao->real_escape_string($dados['observacoes'] ?? '');
$gerar_pix = isset($dados['gerar_pix']) ? (bool)$dados['gerar_pix'] : true;

// Verificar se a tabela quartos existe
$check_table = $conexao->query("SHOW TABLES LIKE 'quartos'");
if ($check_table->num_rows == 0) {
    // Criar tabela quartos
    $sql_create_table = "CREATE TABLE quartos (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        capacidade INT(2) NOT NULL,
        tamanho DECIMAL(6,2),
        descricao TEXT,
        imagem VARCHAR(255),
        status VARCHAR(20) DEFAULT 'disponivel'
    )";
    $conexao->query($sql_create_table);
    
    // Inserir quarto padrão se a tabela estava vazia
    $sql = "INSERT INTO quartos (nome, tipo, preco, capacidade) 
            VALUES ('Quarto Padrão', 'standard', 100.00, 2)";
    $conexao->query($sql);
}

// Verifica se o quarto existe e está disponível
$sql = "SELECT preco, nome FROM quartos WHERE id = $id_quarto";
$resultado = $conexao->query($sql);

if (!$resultado || $resultado->num_rows === 0) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'Quarto não encontrado' : 'Room not found';
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
$sql = "INSERT INTO reservas (codigo, id_quarto, id_hospede, nome_hospede, data_checkin, data_checkout, numero_hospedes, valor_total, status_pagamento, observacoes)
        VALUES ('$codigo', $id_quarto, $id_hospede, '$nome', '$data_checkin', '$data_checkout', $numero_hospedes, $valor_total, 'pendente', '$observacoes')";

if ($conexao->query($sql) === TRUE) {
    $id_reserva = $conexao->insert_id;
    
    // Verificar se a tabela financeiro existe
    $check_table = $conexao->query("SHOW TABLES LIKE 'financeiro'");
    if ($check_table->num_rows == 0) {
        $sql_create_table = "CREATE TABLE financeiro (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_reserva INT,
            tipo VARCHAR(50) NOT NULL,
            valor DECIMAL(10,2) NOT NULL,
            descricao TEXT,
            data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conexao->query($sql_create_table);
    }
    
    // Registrar a reserva no financeiro
    $descricao = "Reserva $codigo - $nome - Check-in: $data_checkin";
    $sql = "INSERT INTO financeiro (id_reserva, tipo, valor, descricao) 
            VALUES ($id_reserva, 'reservation', $valor_total, '$descricao')";
    $conexao->query($sql);
    
    // Criar tabela para registro de mensagens enviadas se não existir
    $check_table = $conexao->query("SHOW TABLES LIKE 'mensagens_enviadas'");
    if ($check_table->num_rows == 0) {
        $sql_create_table = "CREATE TABLE mensagens_enviadas (
            id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            id_reserva INT(11) NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conexao->query($sql_create_table);
    }
    
    // Preparar e enviar a mensagem de WhatsApp
    $data_checkin_formatada = date($lang == 'pt' ? 'd/m/Y' : 'm/d/Y', strtotime($data_checkin));
    $data_checkout_formatada = date($lang == 'pt' ? 'd/m/Y' : 'm/d/Y', strtotime($data_checkout));
    
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
    
    // URL direta para WhatsApp Web
    $whatsapp_url = "https://wa.me/" . preg_replace('/[^0-9]/', '', $telefone) . "?text=" . urlencode($mensagem_whatsapp);
    
    // Verifica se devemos enviar e-mail
    $enviar_email = isset($dados['enviar_email']) ? (bool)$dados['enviar_email'] : true;
    $email_enviado = false;
    
    if ($enviar_email) {
        // Verificar se o PHPMailer está disponível
        if (file_exists('../vendor/autoload.php')) {
            require '../vendor/autoload.php';
            
            try {
                $mail = new PHPMailer\PHPMailer\PHPMailer(true);
                
                // Configurações do servidor de e-mail
                $mail->isSMTP();
                $mail->Host       = 'smtp.example.com'; // Substitua pelo seu servidor SMTP
                $mail->SMTPAuth   = true;
                $mail->Username   = 'reservas@example.com'; // Substitua pelo seu e-mail
                $mail->Password   = 'senha_secreta'; // Substitua pela sua senha
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;
                
                // Destinatários
                $mail->setFrom('reservas@pousadaviva.com.br', 'Reservas PousadaViva');
                $mail->addAddress($email, $nome);
                
                // Conteúdo
                $mail->isHTML(true);
                $mail->Subject = $lang == 'pt' ? 'Confirmação de Reserva - PousadaViva' : 'Reservation Confirmation - PousadaViva';
                
                // Corpo do e-mail em HTML
                $mail->Body = '
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
                        .content { padding: 20px; }
                        .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; }
                        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>PousadaViva</h1>
                            <p>' . ($lang == 'pt' ? 'Confirmação de Reserva' : 'Reservation Confirmation') . '</p>
                        </div>
                        <div class="content">
                            <p>' . ($lang == 'pt' ? 'Olá' : 'Hello') . ', <strong>' . $nome . '</strong>!</p>
                            <p>' . ($lang == 'pt' ? 'Sua reserva foi confirmada com sucesso:' : 'Your reservation has been successfully confirmed:') . '</p>
                            
                            <table>
                                <tr>
                                    <th>' . ($lang == 'pt' ? 'Código da Reserva' : 'Reservation Code') . '</th>
                                    <td>' . $codigo . '</td>
                                </tr>
                                <tr>
                                    <th>' . ($lang == 'pt' ? 'Check-in' : 'Check-in') . '</th>
                                    <td>' . $data_checkin_formatada . '</td>
                                </tr>
                                <tr>
                                    <th>' . ($lang == 'pt' ? 'Check-out' : 'Check-out') . '</th>
                                    <td>' . $data_checkout_formatada . '</td>
                                </tr>
                                <tr>
                                    <th>' . ($lang == 'pt' ? 'Quarto' : 'Room') . '</th>
                                    <td>' . $nome_quarto . '</td>
                                </tr>
                                <tr>
                                    <th>' . ($lang == 'pt' ? 'Hóspedes' : 'Guests') . '</th>
                                    <td>' . $numero_hospedes . '</td>
                                </tr>
                                <tr>
                                    <th>' . ($lang == 'pt' ? 'Valor Total' : 'Total Amount') . '</th>
                                    <td>' . ($lang == 'pt' ? 'R$' : '$') . ' ' . number_format($valor_total, 2, ',', '.') . '</td>
                                </tr>
                            </table>
                            
                            <p>' . ($lang == 'pt' ? 'Estamos ansiosos para recebê-lo(a)!' : 'We are looking forward to welcoming you!') . '</p>
                        </div>
                        <div class="footer">
                            <p>PousadaViva © ' . date('Y') . '</p>
                        </div>
                    </div>
                </body>
                </html>';
                
                $mail->AltBody = strip_tags(str_replace('<br>', "\n", $mail->Body));
                
                $mail->send();
                $email_enviado = true;
                
                // Registrar envio de e-mail
                $sql = "INSERT INTO mensagens_enviadas (id_reserva, tipo) VALUES ($id_reserva, 'email')";
                $conexao->query($sql);
            } catch (Exception $e) {
                error_log("Erro ao enviar e-mail: " . $e->getMessage());
                $email_enviado = false;
            }
        } else {
            error_log("PHPMailer não encontrado. Instale com: composer require phpmailer/phpmailer");
            $email_enviado = false;
        }
    }
    
    // Calcular valor do depósito (30% do valor total)
    $deposito = $valor_total * 0.3;
    
    // Gerar QR Code PIX se solicitado
    $pix_url = '';
    if ($gerar_pix) {
        // Verificar se o script de gerar QR code existe
        if (file_exists('admin/gerar_qrcode_pix.php')) {
            // Obter configurações PIX do banco
            $sql_settings = "SELECT chave_pix, tipo_chave_pix, beneficiario_pix FROM configuracoes LIMIT 1";
            $result_settings = $conexao->query($sql_settings);
            
            $chave_pix = '';
            $tipo_chave_pix = '';
            $beneficiario_pix = '';
            
            if ($result_settings && $result_settings->num_rows > 0) {
                $row_settings = $result_settings->fetch_assoc();
                $chave_pix = $row_settings['chave_pix'] ?? '';
                $tipo_chave_pix = $row_settings['tipo_chave_pix'] ?? 'CPF';
                $beneficiario_pix = $row_settings['beneficiario_pix'] ?? '';
            } else {
                // Valores padrão se não houver configurações
                $chave_pix = '12345678901';
                $tipo_chave_pix = 'CPF';
                $beneficiario_pix = 'PousadaViva';
            }
            
            // Preparar dados para o PIX
            $descricao_pix = "Reserva $codigo - Entrada";
            $valor_pix = number_format($deposito, 2, '.', '');
            
            // Criar URL para gerar QR code
            $pix_url = "/backend/admin/gerar_qrcode_pix.php?chave=$chave_pix&tipoChave=$tipo_chave_pix&beneficiario=$beneficiario_pix&valor=$valor_pix&descricao=$descricao_pix&id_reserva=$id_reserva";
        }
    }
    
    // Compor resposta de sucesso
    $mensagem_sucesso = $lang == 'pt' ? 'Reserva criada com sucesso' : 'Reservation created successfully';
    
    echo json_encode([
        'sucesso' => true, 
        'id' => $id_reserva, 
        'codigo' => $codigo,
        'valor_total' => $valor_total,
        'valor_deposito' => $deposito,
        'mensagem' => $mensagem_sucesso,
        'whatsapp_url' => $whatsapp_url,
        'email_enviado' => $email_enviado,
        'pix_url' => $pix_url
    ]);
    
    // Registrar envio de WhatsApp
    $sql = "INSERT INTO mensagens_enviadas (id_reserva, tipo) VALUES ($id_reserva, 'whatsapp')";
    $conexao->query($sql);
} else {
    error_log("Erro ao criar reserva: " . $conexao->error);
    http_response_code(500);
    $erro = $lang == 'pt' ? 'Erro ao criar reserva: ' . $conexao->error : 'Error creating reservation: ' . $conexao->error;
    echo json_encode(['erro' => $erro]);
}

$conexao->close();
?>
