
// Sample bus data
const buses = [
    {
        id: 1,
        name: "Orange Travels",
        from: "Kurnool",
        to: "Hyderabad",
        departure: "09:00 AM",
        arrival: "03:00 PM",
        price: 650
    },
    {
        id: 2,
        name: "VRL Travels",
        from: "Kurnool",
        to: "Bangalore",
        departure: "10:00 PM",
        arrival: "06:00 AM",
        price: 900
    },
    {
        id: 3,
        name: "Morning Star",
        from: "Hyderabad",
        to: "Vijayawada",
        departure: "08:00 AM",
        arrival: "02:00 PM",
        price: 550
    },
    {
        id: 4,
        name: "Kaveri Travels",
        from: "Kurnool",
        to: "Tirupati",
        departure: "09:30 PM",
        arrival: "05:30 AM",
        price: 750
    }
];

function getData(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : (JSON.parse(value) ?? fallback);
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Registration
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;

        const users = getData("users");

        if (users.some(user => user.email === email)) {
            document.getElementById("registerMessage").textContent =
                "Email already registered!";
            return;
        }

        users.push({ name, email, password });
        saveData("users", users);

        document.getElementById("registerMessage").textContent =
            "Registration successful! Please login.";

        registerForm.reset();
    });
}

// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = getData("users");

        const user = users.find(u =>
            u.email === email && u.password === password
        );

        if (user) {
            saveData("currentUser", user);
            window.location.href = "index.html";
        } else {
            document.getElementById("loginMessage").textContent =
                "Invalid email or password!";
        }
    });
}

// Search buses
const searchForm = document.getElementById("searchForm");

if (searchForm) {
    const dateInput = document.getElementById("travelDate");

    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.min = today;

    searchForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const from = document.getElementById("source").value.trim();
        const to = document.getElementById("destination").value.trim();
        const date = dateInput.value;

        if (from.toLowerCase() === to.toLowerCase()) {
            alert("Source and destination cannot be the same!");
            return;
        }

        const results = buses.filter(bus =>
            bus.from.toLowerCase() === from.toLowerCase() &&
            bus.to.toLowerCase() === to.toLowerCase()
        );

        const container = document.getElementById("busResults");
        container.innerHTML = "";

        if (results.length === 0) {
            container.textContent = "No buses found!";
            return;
        }

        results.forEach(bus => {
            const card = document.createElement("div");
            card.className = "bus-card";

            const title = document.createElement("h3");
            title.textContent = bus.name;

            const details = document.createElement("p");
            details.textContent =
                `${bus.from} → ${bus.to} | ${bus.departure} - ${bus.arrival}`;

            const price = document.createElement("p");
            price.className = "price";
            price.textContent = `₹${bus.price}`;

            const button = document.createElement("button");
            button.textContent = "Select Seats";

            button.onclick = function() {
                saveData("selectedBus", bus);
                saveData("travelDate", date);
                saveData("selectedSeats", []);
                window.location.href = "seats.html";
            };

            card.append(title, details, price, button);
            container.appendChild(card);
        });
    });
}

// Seat selection
const seatLayout = document.getElementById("seatLayout");

if (seatLayout) {
    const bus = getData("selectedBus", null);
    const date = getData("travelDate", "");

    if (!bus || !date) {
        seatLayout.textContent = "Please search and select a bus first.";
    } else {
        document.getElementById("selectedBusInfo").textContent =
            `${bus.name} | ${bus.from} to ${bus.to} | ${date}`;

        let selectedSeats = getData("selectedSeats", []);
        const bookedSeats = getData("bookings", [])
            .filter(booking => booking.busId === bus.id && booking.date === date)
            .flatMap(booking => booking.seats);

        for (let i = 1; i <= 40; i++) {
            const seat = document.createElement("button");

            seat.textContent = i;
            seat.className = "seat";

            if (bookedSeats.includes(i)) {
                seat.classList.add("booked");
                seat.disabled = true;
            } else if (selectedSeats.includes(i)) {
                seat.classList.add("selected");
            }

            seat.onclick = function() {
                if (selectedSeats.includes(i)) {
                    selectedSeats = selectedSeats.filter(s => s !== i);
                    seat.classList.remove("selected");
                } else {
                    if (selectedSeats.length >= 6) {
                        alert("Maximum 6 seats allowed!");
                        return;
                    }

                    selectedSeats.push(i);
                    seat.classList.add("selected");
                }

                updateSeatTotal();
            };

            seatLayout.appendChild(seat);
        }

        updateSeatTotal();

        function updateSeatTotal() {
            document.getElementById("seatTotal").textContent =
                "Selected Seats: " + selectedSeats.join(", ");

            document.getElementById("seatPrice").textContent =
                "Total: ₹" + selectedSeats.length * bus.price;

            saveData("selectedSeats", selectedSeats);
        }
    }
}

// Continue to passenger booking
function continueBooking() {
    const seats = getData("selectedSeats");

    if (seats.length === 0) {
        alert("Please select at least one seat!");
        return;
    }

    window.location.href = "booking.html";
}

// Passenger booking
const passengerForm = document.getElementById("passengerForm");

if (passengerForm) {
    const bus = getData("selectedBus", null);
    const seats = getData("selectedSeats");
    const date = getData("travelDate", "");

    const summary = document.getElementById("bookingSummary");

    if (!bus || seats.length === 0) {
        summary.textContent = "Please select a bus and seats first.";
        passengerForm.hidden = true;
    } else {
        summary.textContent =
            `Bus: ${bus.name} | Route: ${bus.from} to ${bus.to} | Date: ${date} | Seats: ${seats.join(", ")} | Total: ₹${seats.length * bus.price}`;
    }

    passengerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        if (!bus || seats.length === 0) return;

        const bookings = getData("bookings");
        const unavailableSeats = bookings
            .filter(booking => booking.busId === bus.id && booking.date === date)
            .flatMap(booking => booking.seats);

        if (seats.some(seat => unavailableSeats.includes(seat))) {
            alert("One or more selected seats were just booked. Please choose different seats.");
            window.location.href = "seats.html";
            return;
        }

        const booking = {
            id: "BUS" + Date.now(),
            name: document.getElementById("passengerName").value.trim(),
            age: document.getElementById("passengerAge").value,
            gender: document.getElementById("passengerGender").value,
            phone: document.getElementById("passengerPhone").value,
            busId: bus.id,
            bus: bus.name,
            from: bus.from,
            to: bus.to,
            date: date,
            seats: seats,
            total: seats.length * bus.price
        };

        bookings.push(booking);

        saveData("bookings", bookings);
        saveData("lastBookingId", booking.id);
        saveData("selectedSeats", []);

        window.location.href = "tickets.html";
    });
}

// My bookings page
const myBookings = document.getElementById("myBookings");

if (myBookings) {
    const bookings = getData("bookings");

    myBookings.innerHTML = "";

    if (bookings.length === 0) {
        myBookings.textContent = "No bookings found!";
    } else {
        bookings.forEach(booking => {
            const card = document.createElement("div");
            card.className = "bus-card";

            const details = document.createElement("p");
            details.textContent =
                `ID: ${booking.id} | ${booking.name} | ${booking.bus} | ${booking.from} to ${booking.to} | Date: ${booking.date} | Seats: ${booking.seats.join(", ")} | ₹${booking.total}`;

            card.appendChild(details);

            const button = document.createElement("button");
            button.textContent = "View Ticket";

            button.onclick = function() {
                saveData("lastBookingId", booking.id);
                window.location.href = "tickets.html";
            };

            card.appendChild(button);
            myBookings.appendChild(card);
        });
    }
}

// Ticket page
const ticketDetails = document.getElementById("ticketDetails");

if (ticketDetails) {
    const bookings = getData("bookings");
    const id = getData("lastBookingId", "");

    const booking = bookings.find(b => b.id === id);

    ticketDetails.innerHTML = "";

    if (!booking) {
        ticketDetails.textContent = "No ticket found!";
    } else {
        const heading = document.createElement("h2");
        heading.textContent = "Booking Confirmed!";

        const details = document.createElement("div");
        details.innerHTML = `
            <p><b>Booking ID:</b> ${booking.id}</p>
            <p><b>Passenger:</b> ${booking.name}</p>
            <p><b>Age:</b> ${booking.age}</p>
            <p><b>Gender:</b> ${booking.gender}</p>
            <p><b>Phone:</b> ${booking.phone}</p>
            <p><b>Bus:</b> ${booking.bus}</p>
            <p><b>Route:</b> ${booking.from} → ${booking.to}</p>
            <p><b>Journey Date:</b> ${booking.date}</p>
            <p><b>Seat Numbers:</b> ${booking.seats.join(", ")}</p>
            <h3>Total Amount: ₹${booking.total}</h3>
        `;

        ticketDetails.append(heading, details);
    }
}
