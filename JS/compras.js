// =============================================
// COMPRAS.JS
// Modulo para registrar compras de productos
// a proveedores. Se envia a Google Sheets via POST.
// =============================================

var itemsCompraActual = [];

function abrirVistaCompras() {
    itemsCompraActual = [];
    renderizarItemsCompra();
    // Cargo proveedores en el select
    var select = document.getElementById("select-proveedor-compra");
    select.innerHTML = '<option value="">Sin proveedor</option>';
    for (var i = 0; i < listaProveedores.length; i++) {
        select.innerHTML += '<option value="' + listaProveedores[i].id + '">' + listaProveedores[i].nombre + '</option>';
    }
    // Cargo productos en el select
    var selectProd = document.getElementById("select-producto-compra");
    selectProd.innerHTML = '<option value="">Selecciona un producto</option>';
    for (var j = 0; j < listaProductos.length; j++) {
        selectProd.innerHTML += '<option value="' + listaProductos[j].id + '">' + listaProductos[j].nombre + '</option>';
    }
    mostrarVista("vista-compras");
}

function agregarItemCompra() {
    var idProducto = document.getElementById("select-producto-compra").value;
    var cantidad = parseInt(document.getElementById("cantidad-compra").value);
    var costo = parseFloat(document.getElementById("costo-compra").value);

    if (!idProducto) {
        mostrarNotificacion("Selecciona un producto", "error");
        return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion("La cantidad debe ser mayor a cero", "error");
        return;
    }
    if (isNaN(costo) || costo < 0) {
        mostrarNotificacion("El costo debe ser un número válido", "error");
        return;
    }

    var nombreProducto = "";
    for (var i = 0; i < listaProductos.length; i++) {
        if (listaProductos[i].id == idProducto) {
            nombreProducto = listaProductos[i].nombre;
            break;
        }
    }

    // Si ya estaba en la lista, sumo la cantidad
    var existente = null;
    for (var j = 0; j < itemsCompraActual.length; j++) {
        if (itemsCompraActual[j].idProducto == idProducto) {
            existente = itemsCompraActual[j];
            break;
        }
    }

    if (existente != null) {
        existente.cantidad += cantidad;
        existente.costo = costo;
    } else {
        itemsCompraActual.push({ idProducto: idProducto, nombre: nombreProducto, cantidad: cantidad, costo: costo });
    }

    // Limpio los campos
    document.getElementById("select-producto-compra").value = "";
    document.getElementById("cantidad-compra").value = "";
    document.getElementById("costo-compra").value = "";

    renderizarItemsCompra();
}

function quitarItemCompra(idProducto) {
    var nuevos = [];
    for (var i = 0; i < itemsCompraActual.length; i++) {
        if (itemsCompraActual[i].idProducto != idProducto) {
            nuevos.push(itemsCompraActual[i]);
        }
    }
    itemsCompraActual = nuevos;
    renderizarItemsCompra();
}

function calcularTotalCompra() {
    var total = 0;
    for (var i = 0; i < itemsCompraActual.length; i++) {
        total += itemsCompraActual[i].costo * itemsCompraActual[i].cantidad;
    }
    return total;
}

function renderizarItemsCompra() {
    var tabla = document.getElementById("tabla-items-compra");
    var filas = document.getElementById("filas-items-compra");
    var vacio = document.getElementById("compra-vacia");
    var totalDiv = document.getElementById("total-compra");

    if (itemsCompraActual.length == 0) {
        vacio.classList.remove("oculto");
        tabla.classList.add("oculto");
        totalDiv.textContent = "Total: $ 0";
        return;
    }

    vacio.classList.add("oculto");
    tabla.classList.remove("oculto");

    var html = "";
    for (var i = 0; i < itemsCompraActual.length; i++) {
        var item = itemsCompraActual[i];
        var subtotal = item.costo * item.cantidad;
        html +=
            '<tr>' +
                '<td>' + item.nombre + '</td>' +
                '<td>' + item.cantidad + '</td>' +
                '<td class="texto-mono">' + formatearPrecio(item.costo) + '</td>' +
                '<td class="texto-mono">' + formatearPrecio(subtotal) + '</td>' +
                '<td><button class="btn-tabla peligro" onclick="quitarItemCompra(\'' + item.idProducto + '\')">✕</button></td>' +
            '</tr>';
    }
    filas.innerHTML = html;
    totalDiv.textContent = "Total: " + formatearPrecio(calcularTotalCompra());
}

async function registrarCompra() {
    if (itemsCompraActual.length == 0) {
        mostrarNotificacion("Agrega al menos un producto a la compra", "error");
        return;
    }

    var proveedorId = document.getElementById("select-proveedor-compra").value;

    var compra = {
        id: generarId("C"),
        fecha: new Date().toISOString(),
        proveedorId: proveedorId,
        total: calcularTotalCompra(),
        items: itemsCompraActual
    };

    mostrarLoader("Registrando compra...");
    try {
        await guardarCompraEnAPI(compra);

        // Actualizo el stock de cada producto comprado
        for (var i = 0; i < itemsCompraActual.length; i++) {
            var item = itemsCompraActual[i];
            for (var j = 0; j < listaProductos.length; j++) {
                if (listaProductos[j].id == item.idProducto) {
                    if (listaProductos[j].controlInventario && listaProductos[j].stock != null) {
                        listaProductos[j].stock += item.cantidad;
                    }
                    break;
                }
            }
        }

        itemsCompraActual = [];
        renderizarItemsCompra();
        mostrarNotificacion("Compra registrada correctamente", "exito");
    } catch (error) {
        mostrarNotificacion("Error al registrar la compra: " + error.message, "error");
    } finally {
        ocultarLoader();
    }
}