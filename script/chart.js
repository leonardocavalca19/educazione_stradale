document.addEventListener("DOMContentLoaded", function(){
    const ctx = document.getElementById("myChart");

    const incidentiConLesioni = [
        { anno: 2019, numero : 172183 },
        { anno: 2020, numero : 118298 },
        { anno: 2021, numero : 151875 },
        { anno: 2022, numero : 165889 },
        { anno: 2023, numero : 166525 }
    ];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: incidentiConLesioni.map(row => row.anno),
            datasets: [{
                label: "Incidenti con lesioni",
                data: incidentiConLesioni.map(row => row.numero),
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});