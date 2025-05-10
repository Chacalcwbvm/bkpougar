
<?php
header('Content-Type: text/html; charset=utf-8');

require 'conexao.php';

echo "<h1>Configurando banco de dados PousadaViva</h1>";

// Cria tabela de quartos
$sql_create_quartos = "CREATE TABLE IF NOT EXISTS quartos (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    descricao TEXT,
    description TEXT,
    preco DECIMAL(10,2) NOT NULL,
    capacidade INT(2) NOT NULL,
    tamanho INT(3) NOT NULL,
    status ENUM('disponivel', 'ocupado', 'manutencao') DEFAULT 'disponivel',
    imagem VARCHAR(255),
    camas INT(2) DEFAULT 1,
    banheiros INT(1) DEFAULT 1,
    wifi TINYINT(1) DEFAULT 1,
    ar_condicionado TINYINT(1) DEFAULT 1,
    tv TINYINT(1) DEFAULT 1,
    frigobar TINYINT(1) DEFAULT 0
)";

if ($conexao->query($sql_create_quartos) === TRUE) {
    echo "<p>Tabela 'quartos' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'quartos': " . $conexao->error . "</p>";
}

// Cria tabela de hóspedes
$sql_create_hospedes = "CREATE TABLE IF NOT EXISTS hospedes (
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

if ($conexao->query($sql_create_hospedes) === TRUE) {
    echo "<p>Tabela 'hospedes' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'hospedes': " . $conexao->error . "</p>";
}

// Cria tabela de reservas
$sql_create_reservas = "CREATE TABLE IF NOT EXISTS reservas (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    id_quarto INT(11) NOT NULL,
    id_hospede INT(11) NOT NULL,
    data_checkin DATE NOT NULL,
    data_checkout DATE NOT NULL,
    numero_hospedes INT(2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'confirmada',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_quarto) REFERENCES quartos(id),
    FOREIGN KEY (id_hospede) REFERENCES hospedes(id)
)";

if ($conexao->query($sql_create_reservas) === TRUE) {
    echo "<p>Tabela 'reservas' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'reservas': " . $conexao->error . "</p>";
}

// Cria tabela de ocupação para monitorar datas ocupadas por quarto
$sql_create_ocupacao = "CREATE TABLE IF NOT EXISTS ocupacao (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_quarto INT(11) NOT NULL,
    data DATE NOT NULL,
    id_reserva INT(11) NOT NULL,
    FOREIGN KEY (id_quarto) REFERENCES quartos(id),
    FOREIGN KEY (id_reserva) REFERENCES reservas(id),
    UNIQUE KEY (id_quarto, data)
)";

if ($conexao->query($sql_create_ocupacao) === TRUE) {
    echo "<p>Tabela 'ocupacao' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'ocupacao': " . $conexao->error . "</p>";
}

// Cria tabela de contatos 
$sql_create_contatos = "CREATE TABLE IF NOT EXISTS contatos (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    mensagem TEXT NOT NULL,
    status ENUM('novo', 'respondido', 'arquivado') DEFAULT 'novo',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conexao->query($sql_create_contatos) === TRUE) {
    echo "<p>Tabela 'contatos' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'contatos': " . $conexao->error . "</p>";
}

// Cria tabela de administradores
$sql_create_admin = "CREATE TABLE IF NOT EXISTS administradores (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    ultimo_acesso TIMESTAMP NULL,
    UNIQUE KEY (email)
)";

if ($conexao->query($sql_create_admin) === TRUE) {
    echo "<p>Tabela 'administradores' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'administradores': " . $conexao->error . "</p>";
}

// Cria tabela de configurações
$sql_create_configuracoes = "CREATE TABLE IF NOT EXISTS configuracoes (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_site VARCHAR(100) NOT NULL DEFAULT 'PousadaViva',
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    horario_checkin TIME DEFAULT '15:00:00',
    horario_checkout TIME DEFAULT '11:00:00',
    moeda CHAR(3) DEFAULT 'USD',
    logo_url VARCHAR(255),
    pix_key VARCHAR(100),
    pix_key_type VARCHAR(20) DEFAULT 'CPF',
    pix_beneficiary VARCHAR(100),
    reservation_deposit_percentage INT(3) DEFAULT 30,
    manager_whatsapp VARCHAR(20),
    email_api_key VARCHAR(100),
    whatsapp_api_key VARCHAR(100),
    whatsapp_business_phone VARCHAR(20),
    whatsapp_business_id VARCHAR(30),
    notification_settings TEXT,
    email_settings TEXT
)";

if ($conexao->query($sql_create_configuracoes) === TRUE) {
    echo "<p>Tabela 'configuracoes' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'configuracoes': " . $conexao->error . "</p>";
}

// Cria tabela financeiro
$sql_create_financeiro = "CREATE TABLE IF NOT EXISTS financeiro (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT(11),
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    data_transacao DATETIME NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comprovante VARCHAR(255),
    status VARCHAR(20) DEFAULT 'concluido',
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
)";

if ($conexao->query($sql_create_financeiro) === TRUE) {
    echo "<p>Tabela 'financeiro' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'financeiro': " . $conexao->error . "</p>";
}

// Cria tabela logs_financeiro para registros de operações financeiras
$sql_create_logs_financeiro = "CREATE TABLE IF NOT EXISTS logs_financeiro (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT(11),
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_transacao DATETIME NOT NULL,
    detalhes TEXT,
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
)";

if ($conexao->query($sql_create_logs_financeiro) === TRUE) {
    echo "<p>Tabela 'logs_financeiro' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'logs_financeiro': " . $conexao->error . "</p>";
}

// Cria tabela mensagens_enviadas
$sql_create_mensagens = "CREATE TABLE IF NOT EXISTS mensagens_enviadas (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT(11) NOT NULL,
    tipo ENUM('email', 'whatsapp') NOT NULL,
    destinatario VARCHAR(100) NOT NULL,
    conteudo TEXT,
    status VARCHAR(20) DEFAULT 'enviado',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
)";

if ($conexao->query($sql_create_mensagens) === TRUE) {
    echo "<p>Tabela 'mensagens_enviadas' criada ou já existente.</p>";
} else {
    echo "<p>Erro ao criar tabela 'mensagens_enviadas': " . $conexao->error . "</p>";
}

// Insere dados de exemplo se a tabela quartos estiver vazia
$check_quartos = $conexao->query("SELECT COUNT(*) as total FROM quartos");
$row = $check_quartos->fetch_assoc();

if ($row['total'] == 0) {
    $quartos_exemplo = [
        [
            'nome' => 'Quarto Standard',
            'name' => 'Standard Room',
            'descricao' => 'Quarto confortável com todas as comodidades básicas.',
            'description' => 'Comfortable room with all basic amenities.',
            'preco' => 120.00,
            'capacidade' => 2,
            'tamanho' => 20,
            'status' => 'disponivel',
            'imagem' => ''
        ],
        [
            'nome' => 'Quarto Deluxe',
            'name' => 'Deluxe Room',
            'descricao' => 'Quarto espaçoso com vista para o jardim.',
            'description' => 'Spacious room with garden view.',
            'preco' => 180.00,
            'capacidade' => 2,
            'tamanho' => 25,
            'status' => 'disponivel',
            'imagem' => ''
        ],
        [
            'nome' => 'Suíte Premium',
            'name' => 'Premium Suite',
            'descricao' => 'Suíte luxuosa com sala de estar separada.',
            'description' => 'Luxurious suite with separate living area.',
            'preco' => 250.00,
            'capacidade' => 3,
            'tamanho' => 35,
            'status' => 'disponivel',
            'imagem' => ''
        ],
        [
            'nome' => 'Quarto Família',
            'name' => 'Family Room',
            'descricao' => 'Quarto amplo ideal para famílias.',
            'description' => 'Spacious room ideal for families.',
            'preco' => 280.00,
            'capacidade' => 4,
            'tamanho' => 40,
            'status' => 'disponivel',
            'imagem' => ''
        ]
    ];
    
    foreach ($quartos_exemplo as $quarto) {
        $nome = $conexao->real_escape_string($quarto['nome']);
        $name = $conexao->real_escape_string($quarto['name']);
        $descricao = $conexao->real_escape_string($quarto['descricao']);
        $description = $conexao->real_escape_string($quarto['description']);
        $preco = floatval($quarto['preco']);
        $capacidade = intval($quarto['capacidade']);
        $tamanho = intval($quarto['tamanho']);
        $status = $conexao->real_escape_string($quarto['status']);
        $imagem = $conexao->real_escape_string($quarto['imagem']);
        
        $sql = "INSERT INTO quartos (nome, name, descricao, description, preco, capacidade, tamanho, status, imagem) 
                VALUES ('$nome', '$name', '$descricao', '$description', $preco, $capacidade, $tamanho, '$status', '$imagem')";
                
        if ($conexao->query($sql) === TRUE) {
            echo "<p>Quarto '{$nome}' inserido com sucesso.</p>";
        } else {
            echo "<p>Erro ao inserir quarto '{$nome}': " . $conexao->error . "</p>";
        }
    }
} else {
    echo "<p>Já existem quartos cadastrados no banco de dados.</p>";
}

// Verificar se já existem administradores
$resultado = $conexao->query("SELECT COUNT(*) as total FROM administradores");
$row = $resultado->fetch_assoc();

// Se não houver administradores, criar um administrador padrão
if ($row['total'] == 0) {
    // Senha padrão: admin123 (não use em produção)
    $senha_hash = password_hash('admin123', PASSWORD_DEFAULT);
    $sql = "INSERT INTO administradores (nome, email, senha) VALUES ('Administrador', 'admin@pousadaviva.com', '$senha_hash')";
    
    if ($conexao->query($sql) === TRUE) {
        echo "<p>Administrador padrão criado com sucesso.</p>";
    } else {
        echo "<p>Erro ao criar administrador padrão: " . $conexao->error . "</p>";
    }
}

// Verificar se já existem configurações
$resultado = $conexao->query("SELECT COUNT(*) as total FROM configuracoes");
$row = $resultado->fetch_assoc();

// Se não houver configurações, criar configurações padrão
if ($row['total'] == 0) {
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
    
    $email_settings = json_encode([
        'smtpServer' => 'smtp.example.com',
        'smtpPort' => '587',
        'smtpUsername' => '',
        'smtpPassword' => '',
        'emailSender' => 'noreply@pousadaviva.com',
        'emailReplyTo' => 'info@pousadaviva.com',
        'useSSL' => true,
        'useAuthentication' => true
    ]);
    
    $sql = "INSERT INTO configuracoes (
        nome_site, 
        email, 
        telefone, 
        notification_settings, 
        email_settings
    ) VALUES (
        'PousadaViva', 
        'contato@pousadaviva.com', 
        '+55 12 3456-7890',
        '" . $conexao->real_escape_string($notification_settings) . "',
        '" . $conexao->real_escape_string($email_settings) . "'
    )";
    
    if ($conexao->query($sql) === TRUE) {
        echo "<p>Configurações padrão criadas com sucesso.</p>";
    } else {
        echo "<p>Erro ao criar configurações padrão: " . $conexao->error . "</p>";
    }
}

echo "<p>Configuração do banco de dados concluída!</p>";
echo "<p><a href='../index.html'>Voltar para a página inicial</a></p>";

$conexao->close();
?>
