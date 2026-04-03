// =============================================
// API.JS
// Todas las funciones que hablan con Google Sheets.
// Separo GET (traer datos) y POST (enviar datos).
// Uso async/await en todas para manejar la espera
// de la respuesta del servidor.
// =============================================


// ---- GET: CARGAR DATOS ----

// Funcion generica que trae todos los datos de una hoja
// resource es el nombre de la hoja: "productos", "ventas", etc.
async function obtenerDatos(resource) {
    var respuesta = await fetch(API_URL + "?resource=" + resource);
    if (!respuesta.ok) {
        throw new Error("Error al conectar con el servidor: " + respuesta.status);
    }
    var datos = await respuesta.json();
    if (!datos.success) {
        throw new Error("Error del servidor: " + datos.message);
    }
    return datos.data;
}

// Carga los productos desde Google Sheets y los guarda en listaProductos
async function cargarProductosDesdeAPI() {
    try {
        var datos = await obtenerDatos("productos");
        listaProductos = [];
        for (var i = 0; i < datos.length; i++) {
            var fila = datos[i];
            // Convierto los tipos correctamente porque Sheets devuelve todo como texto
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
            // itemsJson viene como texto, lo convierto a objeto
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

// Funcion generica para enviar un objeto a una hoja de Sheets
async function enviarDatos(resource, objeto) {
    var respuesta = await fetch(API_URL + "?resource=" + resource, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

// Guarda un producto nuevo en Google Sheets
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

// Guarda una venta cerrada en Google Sheets
async function guardarVentaEnAPI(venta) {
    // Busco el cliente si existe
    var clienteId = "";
    if (venta.cliente) {
        clienteId = venta.cliente;
    }
    return await enviarDatos("ventas", {
        id: venta.id,
        fecha: venta.cerradoEn,
        clienteId: clienteId,
        metodoPago: venta.pago.metodo,
        total: venta.total,
        itemsJson: JSON.stringify(venta.items)
    });
}

// Guarda una compra en Google Sheets
async function guardarCompraEnAPI(compra) {
    return await enviarDatos("compras", {
        id: compra.id,
        fecha: compra.fecha,
        proveedorId: compra.proveedorId,
        total: compra.total,
        itemsJson: JSON.stringify(compra.items)
    });
}

// Guarda un cliente en Google Sheets
async function guardarClienteEnAPI(cliente) {
    return await enviarDatos("clientes", {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        correo: cliente.correo
    });
}

// Guarda un proveedor en Google Sheets
async function guardarProveedorEnAPI(proveedor) {
    return await enviarDatos("proveedores", {
        id: proveedor.id,
        nombre: proveedor.nombre,
        telefono: proveedor.telefono,
        correo: proveedor.correo
    });
}

// Guarda una categoria en Google Sheets
async function guardarCategoriaEnAPI(categoria) {
    return await enviarDatos("categorias", {
        id: categoria.id,
        nombre: categoria.nombre
    });
}