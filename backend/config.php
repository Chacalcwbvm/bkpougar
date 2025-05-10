
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Definindo configurações do banco de dados
$host = 'localhost';
$usuario = 'root';  // Usuário padrão do XAMPP
$senha = '';        // Senha padrão do XAMPP
$banco = 'pousada_viva';

// Criar conexão
$conexao = new mysqli($host, $usuario, $senha);

// Verificar conexão
if ($conexao->connect_error) {
    die(json_encode(['erro' => 'Falha na conexão com o banco de dados: ' . $conexao->connect_error]));
}

// Criar banco de dados se não existir
$sql = "CREATE DATABASE IF NOT EXISTS $banco";
if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar banco de dados: ' . $conexao->error]));
}

// Selecionar banco de dados
$conexao->select_db($banco);

// Criar tabela quartos se não existir
$sql = "CREATE TABLE IF NOT EXISTS quartos (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    capacidade INT(11) NOT NULL,
    camas INT(11) NOT NULL,
    banheiros INT(11) NOT NULL,
    wifi TINYINT(1) DEFAULT 1,
    ar_condicionado TINYINT(1) DEFAULT 1,
    tv TINYINT(1) DEFAULT 1,
    frigobar TINYINT(1) DEFAULT 0,
    imagens TEXT,
    status ENUM('disponivel', 'ocupado', 'manutencao') DEFAULT 'disponivel',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela quartos: ' . $conexao->error]));
}

// Criar tabela hospedes se não existir
$sql = "CREATE TABLE IF NOT EXISTS hospedes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    documento VARCHAR(30),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela hospedes: ' . $conexao->error]));
}

// Criar tabela reservas se não existir
$sql = "CREATE TABLE IF NOT EXISTS reservas (
    id INT(11) NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL,
    id_quarto INT(11) NOT NULL,
    id_hospede INT(11) NOT NULL,
    data_checkin DATE NOT NULL,
    data_checkout DATE NOT NULL,
    numero_hospedes INT(11) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    status ENUM('confirmada', 'cancelada', 'concluida') DEFAULT 'confirmada',
    data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY (codigo),
    FOREIGN KEY (id_quarto) REFERENCES quartos(id),
    FOREIGN KEY (id_hospede) REFERENCES hospedes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela reservas: ' . $conexao->error]));
}

// Criar tabela contatos se não existir
$sql = "CREATE TABLE IF NOT EXISTS contatos (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    mensagem TEXT NOT NULL,
    status ENUM('novo', 'respondido', 'arquivado') DEFAULT 'novo',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela contatos: ' . $conexao->error]));
}

// Criar tabela administradores se não existir
$sql = "CREATE TABLE IF NOT EXISTS administradores (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    ultimo_acesso TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela administradores: ' . $conexao->error]));
}

// Criar tabela de configurações se não existir
$sql = "CREATE TABLE IF NOT EXISTS configuracoes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nome_site VARCHAR(100) NOT NULL DEFAULT 'PousadaViva',
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    horario_checkin TIME DEFAULT '15:00:00',
    horario_checkout TIME DEFAULT '11:00:00',
    moeda CHAR(3) DEFAULT 'USD',
    email_api_key VARCHAR(100),
    whatsapp_api_key VARCHAR(100),
    whatsapp_business_phone VARCHAR(20),
    whatsapp_business_id VARCHAR(30),
    notification_settings TEXT, 
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela configuracoes: ' . $conexao->error]));
}

// Criar tabela de mensagens enviadas (para rastrear notificações por WhatsApp e email)
$sql = "CREATE TABLE IF NOT EXISTS mensagens_enviadas (
    id INT(11) NOT NULL AUTO_INCREMENT,
    id_reserva INT(11) NOT NULL,
    tipo ENUM('email', 'whatsapp') NOT NULL,
    destinatario VARCHAR(100) NOT NULL,
    conteudo TEXT,
    status VARCHAR(20) DEFAULT 'enviado',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if (!$conexao->query($sql)) {
    die(json_encode(['erro' => 'Erro ao criar tabela mensagens_enviadas: ' . $conexao->error]));
}

// Verificar se já existem dados na tabela configuracoes
$resultado = $conexao->query("SELECT COUNT(*) as total FROM configuracoes");
$row = $resultado->fetch_assoc();

// Se não houver configurações, inserir configurações padrão
if ($row['total'] == 0) {
    // Configurações de notificação padrão
    $notification_settings = json_encode([
        'emailTemplate' => "Dear {guest_name},\n\nThank you for booking with PousadaViva. Your reservation has been confirmed for {check_in_date} to {check_out_date}.\n\nReservation Details:\nRoom: {room_type}\nGuests: {guests}\nTotal: {total}\n\nWe look forward to welcoming you!\n\nBest regards,\nPousadaViva Team",
        'whatsAppTemplate' => "Hello {guest_name}, your reservation at PousadaViva has been confirmed for {check_in_date} to {check_out_date}. Confirmation code: {reservation_id}. We look forward to welcoming you!",
        'emailNotifications' => true,
        'whatsAppNotifications' => true,
        'confirmationMessages' => true,
        'reminderMessages' => true,
        'notifyForNewBookings' => true,
        'notifyForCancellations' => true
    ]);
    
    $sql = "INSERT INTO configuracoes (nome_site, email, telefone, notification_settings) 
            VALUES ('PousadaViva', 'contato@pousadaviva.com', '+55 12 3456-7890', '$notification_settings')";
    $conexao->query($sql);
}

// Verificar se já existem administradores
$resultado = $conexao->query("SELECT COUNT(*) as total FROM administradores");
$row = $resultado->fetch_assoc();

// Se não houver administradores, criar um administrador padrão
if ($row['total'] == 0) {
    // Senha padrão: admin123 (não use em produção)
    $senha_hash = password_hash('admin123', PASSWORD_DEFAULT);
    $sql = "INSERT INTO administradores (nome, email, senha) VALUES ('Administrador', 'admin@pousadaviva.com', '$senha_hash')";
    $conexao->query($sql);
}

// Verificar se a tabela quartos está vazia
$resultado = $conexao->query("SELECT COUNT(*) as total FROM quartos");
$row = $resultado->fetch_assoc();

// Inserir dados de exemplo se a tabela estiver vazia
if ($row['total'] == 0) {
    $quartos = [
        [
            'nome' => 'Standard Room',
            'descricao' => 'Comfortable room with essential amenities for a pleasant stay.',
            'preco' => 120.00,
            'capacidade' => 2,
            'camas' => 1,
            'banheiros' => 1,
            'imagens' => 'room1.jpg'
        ],
        [
            'nome' => 'Deluxe Room',
            'descricao' => 'Spacious room with added comfort and beautiful views.',
            'preco' => 150.00,
            'capacidade' => 2,
            'camas' => 1,
            'banheiros' => 1,
            'imagens' => 'room2.jpg'
        ],
        [
            'nome' => 'Family Suite',
            'descricao' => 'Perfect for families, with separate areas for parents and children.',
            'preco' => 230.00,
            'capacidade' => 4,
            'camas' => 2,
            'banheiros' => 2,
            'imagens' => 'room3.jpg'
        ],
        [
            'nome' => 'Executive Suite',
            'descricao' => 'Luxury accommodation with separate living area and premium amenities.',
            'preco' => 280.00,
            'capacidade' => 2,
            'camas' => 1,
            'banheiros' => 1,
            'imagens' => 'room4.jpg'
        ],
        [
            'nome' => 'Honeymoon Suite',
            'descricao' => 'Romantic setting with special touches for couples celebrating their love.',
            'preco' => 320.00,
            'capacidade' => 2,
            'camas' => 1,
            'banheiros' => 1,
            'imagens' => 'room5.jpg'
        ],
        [
            'nome' => 'Economy Room',
            'descricao' => 'Budget-friendly option with all the essential amenities.',
            'preco' => 90.00,
            'capacidade' => 1,
            'camas' => 1,
            'banheiros' => 1,
            'imagens' => 'room6.jpg'
        ]
    ];
    
    foreach ($quartos as $quarto) {
        $nome = $conexao->real_escape_string($quarto['nome']);
        $descricao = $conexao->real_escape_string($quarto['descricao']);
        $preco = $quarto['preco'];
        $capacidade = $quarto['capacidade'];
        $camas = $quarto['camas'];
        $banheiros = $quarto['banheiros'];
        $imagens = $conexao->real_escape_string($quarto['imagens']);
        
        $sql = "INSERT INTO quartos (nome, descricao, preco, capacidade, camas, banheiros, imagens) 
                VALUES ('$nome', '$descricao', $preco, $capacidade, $camas, $banheiros, '$imagens')";
        $conexao->query($sql);
    }
}

// Verificar se a coluna notification_settings existe
$check_column = $conexao->query("SHOW COLUMNS FROM configuracoes LIKE 'notification_settings'");
if ($check_column->num_rows == 0) {
    $conexao->query("ALTER TABLE configuracoes ADD COLUMN notification_settings TEXT");
    
    // Atualizar configurações existentes com valores padrão para notification_settings
    $notification_settings = json_encode([
        'emailTemplate' => "Dear {guest_name},\n\nThank you for booking with PousadaViva. Your reservation has been confirmed for {check_in_date} to {check_out_date}.\n\nReservation Details:\nRoom: {room_type}\nGuests: {guests}\nTotal: {total}\n\nWe look forward to welcoming you!\n\nBest regards,\nPousadaViva Team",
        'whatsAppTemplate' => "Hello {guest_name}, your reservation at PousadaViva has been confirmed for {check_in_date} to {check_out_date}. Confirmation code: {reservation_id}. We look forward to welcoming you!",
        'emailNotifications' => true,
        'whatsAppNotifications' => true,
        'confirmationMessages' => true,
        'reminderMessages' => true,
        'notifyForNewBookings' => true,
        'notifyForCancellations' => true
    ]);
    
    $conexao->query("UPDATE configuracoes SET notification_settings = '$notification_settings' WHERE id = 1");
}

// Retornar sucesso
echo json_encode(['sucesso' => true, 'mensagem' => 'Banco de dados e tabelas criados com sucesso!']);

$conexao->close();
?>
