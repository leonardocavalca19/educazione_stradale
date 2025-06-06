document.addEventListener("DOMContentLoaded", function(){
    const ctx = document.getElementById("myChart");
    const tortaEbbrezza = document.getElementById('tortaEbbrezza');
    const tortaCellulare = document.getElementById("tortaCellulare");
    const tortaVelocita = document.getElementById("tortaVelocita");
    const tortaCinture = document.getElementById("tortaCinture");
    const barreAlcol = document.getElementById("barreAlcol");
    const barreCellulare = document.getElementById("barreCellulare");
    const lineVelocita = document.getElementById("lineVelocita")

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
    if(barreAlcol)
    {
        new Chart(barreAlcol, {
            type: 'bar',
            data: {
                labels: ['2015', '2016', '2017', '2018', '2019'],
                datasets: [{
                    label: 'Mortalità da ebbrezza (totale)',
                    data: [1500, 1600, 1700, 1800, 1900],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Mortalità totale',
                    data: [5000, 5200, 5300, 5400, 5500],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
            responsive: true,
            scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Numero di morti'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                            }
                        }
                    }
                }
            }
        });
    }
    if(barreCellulare)
    {
        new Chart(barreCellulare, {
            type: 'bar',
            data: {
                labels: ['< 30 km/h', '30–50 km/h', '50–70 km/h', '70–90 km/h', '> 90 km/h'],
                datasets: [{
                    label: 'Incidenti da uso del cellulare',
                    data: [10, 50, 100, 120, 30],
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Numero di incidenti'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Velocità del veicolo (km/h)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return 'Incidenti: ' + tooltipItem.raw;
                            }
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        });
    }
    if(lineVelocita)
    {
        new Chart(lineVelocita  , {
            type: 'line',
            data: {
                labels: ['0-6', '6-12', '12-18', '18-24'],
                datasets: [{
                    label: 'Numero infrazioni',
                    data: [15, 50, 75, 40],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Infrazioni'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Fascia oraria'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Infrazioni per fascia oraria'
                    }
                }
            }
        });
    }
});