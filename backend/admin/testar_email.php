
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
    
    if (!$dados || empty($dados['destinatario'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Destinatário de e-mail não informado']);
        exit;
    }
    
    // Get email settings from the database
    $sql = "SELECT email_settings FROM configuracoes LIMIT 1";
    $resultado = $conexao->query($sql);
    
    if ($resultado && $resultado->num_rows > 0) {
        $row = $resultado->fetch_assoc();
        $emailSettings = json_decode($row['email_settings'], true);
        
        if (!$emailSettings) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Configurações de e-mail não encontradas']);
            exit;
        }
        
        $to = $dados['destinatario'];
        $subject = $dados['assunto'] ?? 'Teste de Email do PousadaViva';
        $message = "Este é um email de teste enviado pelo sistema PousadaViva.\n\n";
        $message .= "Se você está recebendo esta mensagem, significa que as configurações de email estão funcionando corretamente.\n\n";
        $message .= "Configurações utilizadas:\n";
        $message .= "Servidor SMTP: " . $emailSettings['smtpServer'] . "\n";
        $message .= "Porta: " . $emailSettings['smtpPort'] . "\n";
        $message .= "Remetente: " . $emailSettings['emailSender'] . "\n";
        
        // Set headers
        $headers = "From: " . $emailSettings['emailSender'] . "\r\n";
        $headers .= "Reply-To: " . $emailSettings['emailReplyTo'] . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        // Attempt to send email using PHP's mail function
        $mailSent = @mail($to, $subject, $message, $headers);
        
        if ($mailSent) {
            echo json_encode([
                'sucesso' => true, 
                'mensagem' => 'E-mail de teste enviado com sucesso',
                'detalhes' => [
                    'destinatario' => $dados['destinatario'],
                    'assunto' => $dados['assunto'] ?? 'Teste de Email',
                    'server' => $emailSettings['smtpServer']
                ]
            ]);
        } else {
            echo json_encode([
                'sucesso' => false, 
                'mensagem' => 'Falha ao enviar o e-mail de teste. Verifique se o servidor de email está configurado corretamente.',
                'erro' => error_get_last()['message'] ?? 'Erro desconhecido'
            ]);
        }
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível obter as configurações de e-mail']);
    }
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
}

$conexao->close();
?>
