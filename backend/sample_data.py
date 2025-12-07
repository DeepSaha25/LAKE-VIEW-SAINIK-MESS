# backend/sample_data.py

sample_residents = [
    {
        "id": '1',
        "name": 'Rahul Kumar',
        "room": '101',
        "phone": '9876543210',
        "email": 'rahul@example.com',
        "joinDate": '2024-01-01',
        "bills": [
            {
                "month": 'November',
                "year": 2024,
                "rent": 5000.0,
                "electricity": 800.0,
                "food": 3500.0,
                "other": 200.0,
                "paid": False,
                "dueDate": '2024-11-05',
                "paidDate": None
            },
            {
                "month": 'October',
                "year": 2024,
                "rent": 5000.0,
                "electricity": 750.0,
                "food": 3500.0,
                "other": 150.0,
                "paid": True,
                "paidDate": '2024-10-03',
                "dueDate": '2024-10-05'
            }
        ]
    },
    {
        "id": '2',
        "name": 'Priya Sharma',
        "room": '102',
        "phone": '9876543211',
        "email": 'priya@example.com',
        "joinDate": '2024-02-15',
        "bills": [
            {
                "month": 'November',
                "year": 2024,
                "rent": 5000.0,
                "electricity": 650.0,
                "food": 3500.0,
                "other": 0.0,
                "paid": False,
                "dueDate": '2024-11-05',
                "paidDate": None
            },
            {
                "month": 'October',
                "year": 2024,
                "rent": 5000.0,
                "electricity": 700.0,
                "food": 3500.0,
                "other": 100.0,
                "paid": True,
                "paidDate": '2024-10-02',
                "dueDate": '2024-10-05'
            }
        ]
    },
    {
        "id": '3',
        "name": 'Amit Patel',
        "room": '103',
        "phone": '9876543212',
        "email": 'amit@example.com',
        "joinDate": '2024-01-20',
        "bills": [
            {
                "month": 'November',
                "year": 2024,
                "rent": 5000.0,
                "electricity": 900.0,
                "food": 3500.0,
                "other": 500.0,
                "paid": False,
                "dueDate": '2024-11-05',
                "paidDate": None
            }
        ]
    }
]