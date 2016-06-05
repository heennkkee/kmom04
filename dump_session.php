<?php
session_name(preg_replace('/[^a-z\d]/i', '', __DIR__));
session_start();
if (isset($_GET['unset'])) {
    session_unset($_SESSION);
    echo "unset session";
}
var_dump($_SESSION);
?>
