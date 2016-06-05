<?php
session_name(preg_replace('/[^a-z\d]/i', '', __DIR__));
session_start();

header('Content-type: application/json');

$output = '';

$dsn = 'sqlite:books.sqlite';
try {
    $db = new PDO($dsn);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(array("error" => 'Failed to connect DB.', "code" => 0)));
}

$do = isset($_GET['do']) ? $_GET['do'] : null;

if ($do == 'loadNextBook') {
    if (isset($_POST['loadBook'])) {
        $offset = $_POST['loadBook'];
    } else {
        die(json_encode(array("error" => 'loadBook was not set.', "code" => 1)));
    }

    $sth = $db->prepare('SELECT * FROM books LIMIT ' . $_POST['limit'] . ' OFFSET ' . $offset);
    $sth->execute();
    $res = $sth->fetchAll(PDO::FETCH_ASSOC);

    if (!isset($res[0])) {
        die(json_encode(array("error" => 'All books are loaded', "code" => 2)));
    }
    $jsonArray = array();
    foreach ($res as $subRes) {
        $pushArray = array("title" => $subRes['TITLE'], "img" => $subRes['IMAGE'], "price" => $subRes['PRICE'], "id" => $subRes['ID']);
        array_push($jsonArray, $pushArray);
    }

    echo json_encode($jsonArray);

} elseif ($do == 'addToCart') {
    if (!isset($_POST['addBook'])) {
        die(json_encode(array("error" => 'addBook was not set.', "code" => 4)));
    }

    $bookId = $_POST['addBook'];

    $sth = $db->prepare('SELECT * FROM books WHERE ID = ? ');
    $sth->execute(array($bookId));
    $res = $sth->fetchAll(PDO::FETCH_ASSOC);

    if (!isset($res[0])) {
        die(json_encode(array("error" => 'unable to find book in db.', "code" => 5)));
    }

    if (isset($_SESSION['cart']['items'][$bookId])) {
        $_SESSION['cart']['items'][$bookId]['qty'] = $_SESSION['cart']['items'][$bookId]['qty'] + 1;
        echo json_encode(array('sum' => sumCart(), 'action' => 'update', 'id' => $bookId, 'qty' => $_SESSION['cart']['items'][$bookId]['qty']));
    } else {
        $_SESSION['cart']['items'][$bookId] = array(
            'id' => $res[0]['ID'],
            'img' => $res[0]['IMAGE'],
            'title' => $res[0]['TITLE'],
            'price' => $res[0]['PRICE'],
            'qty' => 1
        );
        echo json_encode(array('sum' => sumCart(), 'action' => 'new', 'title' => $res[0]['TITLE'], 'id' => $bookId, 'qty' => 1, 'price' => $res[0]['PRICE']));
    }
} elseif ($do == 'clearCart') {
    unset($_SESSION['cart']['items']);
    echo json_encode(array('outcome' => 'success'));
} elseif ($do == 'loadCart') {
    if (isset($_SESSION['cart']['items'])) {
        echo json_encode(array($_SESSION['cart']['items'], sumCart()));
    } else {
        echo json_encode('empty');
    }
} elseif ($do == 'removeFromCart') {
    if (!isset($_POST['removeBook'])) {
        die(json_encode(array("error" => 'removeBook was not set.', "code" => 4)));
    }

    $bookId = $_POST['removeBook'];

    if (isset($_SESSION['cart']['items'][$bookId])) {
        if ($_SESSION['cart']['items'][$bookId]['qty'] == 1) {
            unset($_SESSION['cart']['items'][$bookId]);
            echo json_encode(array('action' => 'remove', 'id' => $bookId, 'sum' => sumCart()));
        } else {
            $_SESSION['cart']['items'][$bookId]['qty'] = $_SESSION['cart']['items'][$bookId]['qty'] - 1;
            echo json_encode(array('action' => 'update', 'id' => $bookId, 'qty' => $_SESSION['cart']['items'][$bookId]['qty'], 'sum' => sumCart()));
        }
    } else {
        die(json_encode(array("error" => 'Book was not found in session.', "code" => 4)));
    }
} elseif ($do == 'checkCard') {
    if (!isset($_POST['card'])) {
        die(json_encode(array("error" => 'card was not set.', "code" => 4)));
    }

    $result = luhn_check($_POST['card']);
    echo json_encode(array("result" => $result));
}

function luhn_check($number) {

  // Strip any non-digits (useful for credit card numbers with spaces and hyphens)
  $number=preg_replace('/\D/', '', $number);

  // Set the string length and parity
  $number_length=strlen($number);
  $parity=$number_length % 2;

  // Loop through each digit and do the maths
  $total=0;
  for ($i=0; $i<$number_length; $i++) {
    $digit=$number[$i];
    // Multiply alternate digits by two
    if ($i % 2 == $parity) {
      $digit*=2;
      // If the sum is two digits, add them together (in effect)
      if ($digit > 9) {
        $digit-=9;
      }
    }
    // Total up the digits
    $total+=$digit;
  }

  // If the total mod 10 equals 0, the number is valid
  return ($total % 10 == 0) ? TRUE : FALSE;

}

function sumCart() {
    $sum = 0;
    if (!isset($_SESSION['cart']['items'])) {
        return 0;
    }
    foreach ($_SESSION['cart']['items'] as $item) {
        $sum += $item['qty'] * $item['price'];
    }
    return $sum;
}
