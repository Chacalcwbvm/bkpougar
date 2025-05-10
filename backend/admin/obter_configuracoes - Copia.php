<?php
// C:\xampps\htdocs\pougar\backend\config\get_configuracoes.php

require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Headers: Content-Type');

// Obter todas as configurações
$sql = "SELECT * FROM configuracoes LIMIT 1";
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $config = $resultado->fetch_assoc();

    // Decodificar as configurações de notificação se existirem
    if (isset($config['notification_settings'])) {
        $config['notification_settings'] = json_decode($config['notification_settings'], true);
    } else {
        $config['notification_settings'] = [
            'emailTemplate' => "Dear {guest_name},\n\nThank you for booking with PousadaViva. Your reservation has been confirmed for {check_in_date} to {check_out_date}.\n\nReservation Details:\nRoom: {room_type}\nGuests: {guests}\nTotal: {total}\n\nWe look forward to welcoming you!\n\nBest regards,\nPousadaViva Team",
            'whatsAppTemplate' => "Hello {guest_name}, your reservation at PousadaViva has been confirmed for {check_in_date} to {check_out_date}. Confirmation code: {reservation_id}. We look forward to welcoming you!",
            'emailNotifications' => true,
            'whatsAppNotifications' => true,
            'confirmationMessages' => true,
            'reminderMessages' => true,
            'notifyForNewBookings' => true,
            'notifyForCancellations' => true
        ];
    }

    // Decodificar as configurações de e-mail se existirem
    if (isset($config['email_settings'])) {
        $config['email_settings'] = json_decode($config['email_settings'], true);
    } else {
        $config['email_settings'] = [
            'email_smtp_host' => '',
            'email_smtp_port' => '',
            'email_smtp_usuario' => '',
            'email_smtp_senha' => '',
            'email_remetente_nome' => '',
            'email_remetente_endereco' => '',
            'useSSL' => true,
            'useAuthentication' => true
        ];
    }

    // Formatar dados para o frontend
    $formattedConfig = [
        'generalSettings' => [
            'hotelName' => $config['nome_site'] ?? 'PousadaViva',
            'address' => $config['endereco'] ?? '',
            'phone' => $config['telefone'] ?? '',
            'email' => $config['email'] ?? '',
            'checkInTime' => substr($config['horario_checkin'] ?? '15:00:00', 0, 5),
            'checkOutTime' => substr($config['horario_checkout'] ?? '11:00:00', 0, 5),
            'currency' => $config['moeda'] ?? 'R$'
        ],
        'notificationSettings' => $config['notification_settings'],
        'apiSettings' => [
            'emailApiKey' => $config['email_api_key'] ?? '',
            'whatsAppApiKey' => $config['whatsapp_api_key'] ?? '',
            'whatsAppBusinessPhoneNumber' => $config['whatsapp_business_phone'] ?? '',
            'whatsAppBusinessID' => $config['whatsapp_business_id'] ?? ''
        ],
        'emailSettings' => $config['email_settings']
    ];

    echo json_encode(['sucesso' => true, 'configuracoes' => $formattedConfig]);
} else {
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Configurações não encontradas',
        'erro' => $conexao->error
    ]);
}

$conexao->close();
