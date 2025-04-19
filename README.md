# HawkerGo - A Cloud-Based Order Management System for Singapore Hawker Stalls

## CS5224 Cloud Computing Project

## EXECUTIVE SUMMARY
Hawker stall operators in Singapore face acute operational challenges that compromise both efficiency and profitability—particularly during peak hours. Long queues, manual cash transactions, and outdated menu systems overwhelm stall owners and diminish customer satisfaction. While several digital solutions exist, they either focus narrowly on payment or impose high commissions that deter adoption by smaller hawkers.

HawkerGo addresses these gaps with a cloud-native Software-as-a-Service (SaaS) platform tailored to the needs of the hawker community. Designed with simplicity and cost-efficiency in mind, HawkerGo enables stall operators to create and update digital menus, accept pre-paid orders via QR codes, and receive real-time order notifications—all through a mobile-responsive web interface. Customers benefit from shorter wait times, streamlined ordering, and cashless payment options.

The platform leverages AWS cloud services to ensure scalability, reliability, and minimal operational overhead. A freemium business model keeps barriers to entry low, charging a small fee only after a monthly transaction threshold is crossed. Compared to on-premise setups, the cloud architecture offers dramatic cost savings and logistical simplicity, making it well-suited for the compact and dynamic environment of hawker centres.

HawkerGo is a lightweight operations management platform that helps hawkers make data-driven decisions without needing technical expertise. With intuitive features, scalable infrastructure, and low financial risk, HawkerGo presents a viable pathway to modernising Singapore's traditional food stalls.

## PROJECT STRUCTURE

```
hawker-go/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── assets/            # Images, fonts, and other static assets
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries and configurations
│   ├── pages/             # Page components
│   │   ├── Customer/      # Customer-facing pages
│   │   └── Hawker/        # Hawker-facing pages
│   ├── services/          # API services and external integrations
│   └── utils/             # Helper functions and utilities
├── .gitignore             # Git ignore rules
├── components.json        # UI components configuration
├── index.html             # Entry HTML file
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

### Key Directories

- **src/pages/Customer**: Contains pages for customer-facing features like menu browsing and order placement
- **src/pages/Hawker**: Contains pages for hawker-facing features like order management and menu editing
- **src/services**: Contains API integration code for AWS services and other external APIs
- **src/hooks**: Contains custom React hooks for data fetching and state management
- **src/context**: Contains React context providers for global state management
- **src/components**: Contains reusable UI components used across the application

## Demonstration Guidance

### Customer Function

 ![Stall QR Code](https://github.com/krusagl/cs5224-hawkergo/blob/main/public/stallQR.jpeg)
 
1. Scan the QR code or via [Demo Order](https://id-preview--d078097a-ab13-4032-9dd7-231189aaa372.lovable.app/stall/1) to access the demo stall's menu:
2. Browse the menu and add items to cart
3. Proceed to checkout
4. Enter customer details and payment information
5. Receive order confirmation

### Stall Function
After you scan the stall QR code and order your dishes, you may check its status on our demo stall account
1. Navigate to <https://preview--cs5224-hawkergo.lovable.app/>
2. Click "get started" to navigate to login page
3. Click the button for "demo account" to navigate to the demo stall page
4. Check new order status under recent transactions, or switch to operation mode for more order history.

