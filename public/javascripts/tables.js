document.addEventListener("DOMContentLoaded", () => {
    const tables = document.querySelectorAll(".table.available");
 
    tables.forEach(table => {
        table.addEventListener("click", () => {
            const tableNumber = table.getAttribute("title").split(" ")[1];
            alert(`Odabrali ste stol broj ${tableNumber}`);
            // Možeš dodati modal za potvrdu rezervacije ovdje.
        });
    });
});