document.addEventListener("DOMContentLoaded", function(){
    const ctx = document.getElementById("myChart");
    const tortaEbbrezza = document.getElementById('tortaEbbrezza');
    const tortaCellulare = document.getElementById("tortaCellulare");
    const tortaVelocita = document.getElementById("tortaVelocita");
    const tortaCinture = document.getElementById("tortaCinture");

    const incidentiConLesioni = [
        { anno: 2019, numero : 172183 },
        { anno: 2020, numero : 118298 },
        { anno: 2021, numero : 151875 },
        { anno: 2022, numero : 165889 },
        { anno: 2023, numero : 166525 }
    ];

    if(ctx)
    {
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
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    //Grafico a torta
    if(tortaEbbrezza)
    {
        new Chart(tortaEbbrezza, {
            type: 'pie',
            data: {
                labels: [
                    'Distrazione (cellulare ecc.)',
                    'Eccesso di velocità',
                    'Guida in stato di ebbrezza',
                    'Mancato uso cinture',
                    'Altre cause'
                ],
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        '#f94144',
                        '#f3722c',
                        '#f9c74f',
                        '#90be6d',
                        '#577590'
                    ],
                    borderWidth: 1,
                    offset: [0, 0, 100, 0, 0]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cause principali di incidenti stradali (stima %)'
                    }
                }
            }
        });
    }
    else if(tortaCellulare)
    {
        new Chart(tortaCellulare, {
            type: "pie",
            data: {
                labels: [
                    "Distrazione (cellulare ecc.)",
                    "Eccesso di velocità",
                    "Guida in stato di ebbrezza",
                    "Mancato uso cinture",
                    "Altre cause"
                ],
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        "#f94144",
                        "#f3722c",
                        "#f9c74f",
                        "#90be6d",
                        "#577590"
                    ],
                    borderWidth: 1,
                    offset: [100, 0, 0, 0, 0]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Cause principali di incidenti stradali (stima %)"
                    }
                }
            }
        });
    }
    else if(tortaVelocita)
    {
        new Chart(tortaVelocita, {
            type: "pie",
            data: {
                labels: [
                    "Distrazione (cellulare ecc.)",
                    "Eccesso di velocità",
                    "Guida in stato di ebbrezza",
                    "Mancato uso cinture",
                    "Altre cause"
                ],
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        "#f94144",
                        "#f3722c",
                        "#f9c74f",
                        "#90be6d",
                        "#577590"
                    ],
                    borderWidth: 1,
                    offset: [0, 100, 0, 0, 0]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Cause principali di incidenti stradali (stima %)"
                    }
                }
            }
        });
    }
    else if(tortaCinture)
    {
        new Chart(tortaCinture, {
            type: "pie",
            data: {
                labels: [
                    "Distrazione (cellulare ecc.)",
                    "Eccesso di velocità",
                    "Guida in stato di ebbrezza",
                    "Mancato uso cinture",
                    "Altre cause"
                ],
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        "#f94144",
                        "#f3722c",
                        "#f9c74f",
                        "#90be6d",
                        "#577590"
                    ],
                    borderWidth: 1,
                    offset: [0, 0, 0, 100, 0]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Cause principali di incidenti stradali (stima %)"
                    }
                }
            }
        });
    }
});