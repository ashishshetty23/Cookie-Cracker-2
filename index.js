const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const secretKey = 'Shrash'; // Change this to a secure key in production

// Middleware setup
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample user credentials
const users = {
  guest: 'password',
};

// Middleware to check JWT and admin role
function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.sendStatus(403); // Forbidden

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = decoded; // Save the decoded token payload for later use
    next();
  });
}

// CSS Styles
const styles = `
<style>
  body { 
    font-family: Arial, sans-serif; 
    background: linear-gradient(to right, #74ebd5, #ACB6E5); 
    color: #333; 
    text-align: center; 
    margin: 0; 
    height: 100vh; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
  }
  .container {
    background: white; 
    padding: 30px; 
    border-radius: 10px; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.2); 
    width: 300px; 
  }
  h1 { color: #2c3e50; }
  input { 
    margin: 10px 0; 
    padding: 10px; 
    width: 100%; 
    border: 1px solid #ccc; 
    border-radius: 5px; 
  }
  button { 
    padding: 10px; 
    background-color: #3498db; 
    color: white; 
    border: none; 
    border-radius: 5px; 
    cursor: pointer; 
    width: 100%; 
  }
  button:hover { background-color: #2980b9; }
  a { color: #3498db; }
</style>
`;

// Login page
app.get('/', (req, res) => {
  res.send(`
    ${styles}
    <div class="container">
      <h1>Login</h1>
      <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  `);
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    // Generate JWT with role as 'user'
    const token = jwt.sign({ username, role: 'user' }, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true }); // Set the token as a cookie
    res.send(`
      ${styles}
      <div class="container">
        <h1>Login Successful</h1>
        <p>You are logged in as ${username}. Your token is stored in a cookie.</p>
        <p>Try to access the <a href="/admin">admin page</a> (modify your cookie to gain access).</p>
      </div>
    `);
  } else {
    res.send(`
      ${styles}
      <div class="container">
        <h1>Login Failed</h1>
        <p>Invalid username or password. Please try again.</p>
        <p><a href="/">Back to Login</a></p>
      </div>
    `);
  }
});

// Admin page (protected)
app.get('/admin', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {
    res.send(`
      ${styles}
      <div class="container">
        <h1>Admin Access Granted!</h1>
        <p>Congratulations, you have accessed the admin page!</p>
        <p>Here is the flag: <strong>flag{hjui9opq}</strong></p>
      </div>
    `);
  } else {
    res.status(403).send(`
      ${styles}
      <div class="container">
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page. Modify your cookie to gain access!</p>
        <p><a href="/">Go back</a></p>
      </div>
    `);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`CTF challenge running at http://localhost:${port}`);
});
