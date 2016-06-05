<?php
// Create the session
session_name(preg_replace('/[^a-z\d]/i', '', __DIR__));
session_start();

// Get incoming on what to do
$do = isset($_GET['do']) ? $_GET['do'] : null;

// Do login
if($do == 'login') {
    if(in_array($_POST['user'], array('doe', 'root', 'admin'))) {
        $_SESSION['user'] = $_POST['user'];
        $output = "Successfully login as user: " . $_SESSION['user'];
    }
    else {
        unset($_SESSION['user']);
        $output = "Failed login, try login as doe, root or admin";
    }
} elseif ($do == 'logout') {
    unset($_SESSION['user']);
    $output = "Successfully logged out.";
} elseif ($do == 'status') {
    if (isset($_SESSION['user'])) {
        $output = "Logged in as " . $_SESSION['user'] . ".";
    } else {
        $output = "Not logged in.";
    }
}
sleep(1);
// Deliver the response, as a JSON object containing the name of the user.
header('Content-type: application/json');
echo json_encode(array("output" => $output));
