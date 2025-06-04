// Base de datos en memoria (simulada)
let users = []
let passwordResets = []
let orders = []

// Función para guardar en localStorage
function saveToLocalStorage() {
  localStorage.setItem("users", JSON.stringify(users))
  localStorage.setItem("passwordResets", JSON.stringify(passwordResets))
  localStorage.setItem("orders", JSON.stringify(orders))
}

// Función para cargar desde localStorage
function loadFromLocalStorage() {
  const storedUsers = localStorage.getItem("users")
  const storedResets = localStorage.getItem("passwordResets")
  const storedOrders = localStorage.getItem("orders")

  if (storedUsers) {
    users = JSON.parse(storedUsers)
  } else {
    // Crear usuario admin por defecto
    users = [
      {
        id: "admin",
        username: "admin",
        email: "admin@jorling.com",
        password: hashPassword("admin123"),
        isAdmin: true,
        balance: 1000,
        createdAt: new Date().toISOString(),
      },
    ]
    saveToLocalStorage()
  }

  if (storedResets) {
    passwordResets = JSON.parse(storedResets)
  }

  if (storedOrders) {
    orders = JSON.parse(storedOrders)
  }
}

// Cargar datos al iniciar
loadFromLocalStorage()

// Funciones de autenticación
function hashPassword(password) {
  // Esta es una simulación simple de hash - en producción usar bcrypt
  return btoa(password + "salt123")
}

function findUserByUsername(username) {
  return users.find((user) => user.username === username || user.email === username)
}

function findUserByEmail(email) {
  return users.find((user) => user.email === email)
}

function findUserById(id) {
  return users.find((user) => user.id === id)
}

// Formulario de registro
const registerForm = document.getElementById("registerForm")
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("regUsername").value
    const email = document.getElementById("regEmail").value
    const password = document.getElementById("regPassword").value
    const confirmPassword = document.getElementById("regConfirmPassword").value
    const errorMessage = document.getElementById("regErrorMessage")
    const successMessage = document.getElementById("regSuccessMessage")

    // Limpiar mensajes
    errorMessage.textContent = ""
    successMessage.textContent = ""

    // Validaciones
    if (password !== confirmPassword) {
      errorMessage.textContent = "Las contraseñas no coinciden"
      return
    }

    if (password.length < 6) {
      errorMessage.textContent = "La contraseña debe tener al menos 6 caracteres"
      return
    }

    // Verificar si el usuario ya existe
    if (findUserByUsername(username)) {
      errorMessage.textContent = "El nombre de usuario ya existe"
      return
    }

    if (findUserByEmail(email)) {
      errorMessage.textContent = "El correo electrónico ya está registrado"
      return
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashPassword(password),
      balance: 0, // Saldo inicial 0
      isAdmin: false,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveToLocalStorage()

    successMessage.textContent = "¡Cuenta creada exitosamente! Ya puedes iniciar sesión."

    // Limpiar formulario
    registerForm.reset()
  })
}

// Formulario de login
const loginForm = document.getElementById("loginForm")
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const errorMessage = document.getElementById("errorMessage")

    // Limpiar mensajes
    errorMessage.textContent = ""

    // Buscar usuario
    const user = findUserByUsername(username)

    if (!user) {
      errorMessage.textContent = "Usuario no encontrado"
      return
    }

    // Verificar contraseña
    if (user.password !== hashPassword(password)) {
      errorMessage.textContent = "Contraseña incorrecta"
      return
    }

    // Guardar sesión
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance || 0,
        isAdmin: user.isAdmin || false,
      }),
    )

    // Redirigir según el tipo de usuario
    if (user.isAdmin) {
      window.location.href = "admin.html"
    } else {
      window.location.href = "dashboard.html"
    }
  })
}

// Formulario de recuperación de contraseña
const forgotPasswordForm = document.getElementById("forgotPasswordForm")
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("forgotEmail").value
    const errorMessage = document.getElementById("forgotErrorMessage")
    const successMessage = document.getElementById("forgotSuccessMessage")

    // Limpiar mensajes
    errorMessage.textContent = ""
    successMessage.textContent = ""

    // Buscar usuario
    const user = findUserByEmail(email)

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      successMessage.textContent = "Si el email existe, recibirás un enlace de recuperación"
      return
    }

    // Generar token de recuperación
    const resetToken = Math.random().toString(36).substring(2, 15)

    // Guardar token
    passwordResets.push({
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hora
    })

    saveToLocalStorage()

    // En producción, aquí enviarías un email
    console.log(`Token de recuperación para ${email}: ${resetToken}`)

    successMessage.textContent = "Si el email existe, recibirás un enlace de recuperación"
  })
}

// Botón de logout
const logoutBtn = document.getElementById("logoutBtn")
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser")
    window.location.href = "index.html"
  })
}

// Botón de logout admin
const adminLogoutBtn = document.getElementById("adminLogoutBtn")
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser")
    window.location.href = "index.html"
  })
}
