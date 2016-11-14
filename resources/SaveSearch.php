<!-- Save all search data to a database -->

<?php
$con = $_POST['conID'];

$servername = "localhost";
$username = "ipectrace";
$password = "password";
$dbname = "IpecTraceHistory";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = 'INSERT INTO SearchHistory (timeSearched, con) VALUES (DATE_ADD(NOW(), INTERVAL 15 HOUR), "' . $con . '")';

if ($conn->query($sql) === TRUE) {
    //echo "New record created successfully";
} else {
    //echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();

?>