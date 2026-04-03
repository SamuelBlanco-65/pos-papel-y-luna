// =============================================
// API.JS - CORREGIDO (CORS & REDIRECT)
// =============================================

// ---- GET: CARGAR DATOS ----

async function obtenerDatos(resource) {
    // MODIFICACIÓN: Agregamos el objeto de configuración con mode y redirect
    var respuesta = await fetch(API_URL + "?resource=" + resource, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
    });

    if (!respuesta.ok) {
        throw new Error("Error al conectar con el servidor: " + respuesta.status);
    }
    var datos = await respuesta.json();
    if (!datos.success) {
        throw new Error("Error del servidor: " + datos.message);
    }
    return datos.data;
}

// Carga los productos desde Google Sheets
async function cargarProductosDesdeAPI() {
    try {
        var datos = await obtenerDatos("productos");
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
                controlInventario: String(fila.seguimientoInventario) == "si",
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
        var datos = await obtenerDatos("ventas");
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
        var datos = await obtenerDatos("clientes");
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
        var datos = await obtenerDatos("proveedores");
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
        var datos = await obtenerDatos("categorias");
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

async function enviarDatos(resource, objeto) {
    // MODIFICACIÓN: Agregamos mode: "cors", redirect: "follow" y cambiamos el Content-Type a text/plain
    var respuesta = await fetch(API_URL + "?resource=" + resource, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(objeto)
    });
    if (!respuesta.ok) {
        throw new Error("Error al enviar datos: " + respuesta.status);
    }
    var resultado = await respuesta.json();
    if (!resultado.success) {
        throw new Error("Error del servidor: " + resultado.message);
    }
    return resultado;
}

// Las funciones de guardado (guardarProductoEnAPI, guardarVentaEnAPI, etc.) se mantienen igual 
// porque ya llaman a la nueva versión de enviarDatos() de arriba.

async function guardarProductoEnAPI(producto) {
    return await enviarDatos("productos", {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        costo: producto.costo,
        stock: producto.stock !== null ? producto.stock : "",
        seguimientoInventario: producto.controlInventario ? "si" : "no"
    });
}

async function guardarVentaEnAPI(venta) {
    var clienteId = venta.cliente ? venta.cliente : "";
    return await enviarDatos("ventas", {
        id: venta.id,
        fecha: venta.cerradoEn,
        clienteId: clienteId,
        metodoPago: venta.pago.metodo,
        total: venta.total,
        itemsJson: JSON.stringify(venta.items)
    });
}

async function guardarCompraEnAPI(compra) {
    return await enviarDatos("compras", {
        id: compra.id,
        fecha: compra.fecha,
        proveedorId: compra.proveedorId,
        total: compra.total,
        itemsJson: JSON.stringify(compra.items)
    });
}

async function guardarClienteEnAPI(cliente) {
    return await enviarDatos("clientes", {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo
    });
}

async function guardarProveedorEnAPI(proveedor) {
    return await enviarDatos("proveedores", {
        id: proveedor.id,
        nombre: proveedor.nombre,
        telefono: proveedor.telefono,
        correo: proveedor.correo
    });
}

async function guardarCategoriaEnAPI(categoria) {
    return await enviarDatos("categorias", {
        id: categoria.id,
        nombre: categoria.nombre
    });
}
