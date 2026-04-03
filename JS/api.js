// =============================================
// API.JS - Versión Corregida para MVP 2
// =============================================

// ---- CONFIGURACIÓN ----
// Asegúrate de que esta URL sea la de tu última "Nueva implementación" en Apps Script
// const API_URL = "https://script.google.com/macros/s/TU_ID_DE_DESPLIEGUE/exec";

// ---- GET: CARGAR DATOS ----

// Función genérica que trae todos los datos de una hoja
async function obtenerDatos(resource) {
    try {
        const respuesta = await fetch(API_URL + "?resource=" + resource, {
            method: "GET",
            mode: "cors",
            redirect: "follow" // CRÍTICO: Permite seguir el redireccionamiento de Google
        });

        if (!respuesta.ok) {
            throw new Error("Error al conectar con el servidor: " + respuesta.status);
        }

        const datos = await respuesta.json();
        
        if (!datos.success) {
            throw new Error("Error del servidor: " + datos.message);
        }

        return datos.data;
    } catch (error) {
        console.error("Error en obtenerDatos (" + resource + "):", error);
        throw error;
    }
}

// Carga los productos desde Google Sheets
async function cargarProductosDesdeAPI() {
    try {
        const datos = await obtenerDatos("productos");
        listaProductos = [];
        for (var i = 0; i < datos.length; i++) {
            var fila = datos[i];
            listaProductos.push({
                id: String(fila.id),
                nombre: String(fila.nombre),
                categoria: String(fila.categoria),
                precio: Number(fila.precio),
                costo: Number(fila.costo),
                stock: fila.stock !== "" ? Number(fila.stock) : null,
                controlInventario: String(fila.seguimientoInventario).toLowerCase() === "si",
                codigo: String(fila.id)
            });
        }
    } catch (error) {
        mostrarNotificacion("Error al cargar productos: " + error.message, "error");
    }
}

// Carga las ventas desde Google Sheets
async function cargarVentasDesdeAPI() {
    try {
        const datos = await obtenerDatos("ventas");
        listaVentas = [];
        for (var i = 0; i < datos.length; i++) {
            var fila = datos[i];
            var items = [];
            try {
                items = JSON.parse(fila.itemsJson);
            } catch(e) {
                items = [];
            }
            listaVentas.push({
                id: String(fila.id),
                cerradoEn: String(fila.fecha),
                clienteId: String(fila.clienteId),
                pago: { metodo: String(fila.metodoPago) },
                total: Number(fila.total),
                items: items
            });
        }
    } catch (error) {
        mostrarNotificacion("Error al cargar ventas: " + error.message, "error");
    }
}

// Carga clientes desde Google Sheets
async function cargarClientesDesdeAPI() {
    try {
        const datos = await obtenerDatos("clientes");
        listaClientes = [];
        for (var i = 0; i < datos.length; i++) {
            var fila = datos[i];
            listaClientes.push({
                id: String(fila.id),
                nombre: String(fila.nombre),
                telefono: String(fila.telefono),
                correo: String(fila.correo)
            });
        }
    } catch (error) {
        mostrarNotificacion("Error al cargar clientes: " + error.message, "error");
    }
}

// Carga proveedores desde Google Sheets
async function cargarProveedoresDesdeAPI() {
    try {
        const datos = await obtenerDatos("proveedores");
        listaProveedores = [];
        for (var i = 0; i < datos.length; i++) {
            var fila = datos[i];
            listaProveedores.push({
                id: String(fila.id),
                nombre: String(fila.nombre),
                telefono: String(fila.telefono),
                correo: String(fila.correo)
            });
        }
    } catch (error) {
        mostrarNotificacion("Error al cargar proveedores: " + error.message, "error");
    }
}

// Carga categorias desde Google Sheets
async function cargarCategoriasDesdeAPI() {
    try {
        const datos = await obtenerDatos("categorias");
        listaCategorias = [];
        for (var i = 0; i < datos.length; i++) {
            var fila = datos[i];
            listaCategorias.push({
                id: String(fila.id),
                nombre: String(fila.nombre)
            });
        }
    } catch (error) {
        mostrarNotificacion("Error al cargar categorias: " + error.message, "error");
    }
}


// ---- POST: ENVIAR DATOS ----

// Función genérica para enviar un objeto a una hoja de Sheets
async function enviarDatos(resource, objeto) {
    try {
        const respuesta = await fetch(API_URL + "?resource=" + resource, {
            method: "POST",
            mode: "cors",
            redirect: "follow", // CRÍTICO
            headers: { 
                // Usamos text/plain para evitar problemas de preflight/CORS complejos en Apps Script
                "Content-Type": "text/plain;charset=utf-8" 
            },
            body: JSON.stringify(objeto)
        });

        if (!respuesta.ok) {
            throw new Error("Error al enviar datos: " + respuesta.status);
        }

        const resultado = await respuesta.json();
        
        if (!resultado.success) {
            throw new Error("Error del servidor
