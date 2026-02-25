// Core shared metrics (Padding, margins, scaling stays mathematically consistent)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

// Base Theme Interface
export interface DomainTheme {
    colors: {
        primary: string;
        background: string;
        surface: string;
        text: string;
        textOnPrimary: string;
        accent: string;
        alert: string;
    };
    typography: {
        fontFamily: string;
        headingWeight: string;
    };
    radii: {
        base: number;
        button: number;
        card: number;
    };
    animation: {
        tension: number;
        friction: number;
    };
}

// ---------------------------------------------------------
// DOMAIN 1: CAR (Industrial, Sharp, High Contrast)
// ---------------------------------------------------------
export const CarTheme: DomainTheme = {
    colors: {
        primary: '#FACC15',     // Warning Yellow
        background: '#000000',  // Industrial Black
        surface: '#111111',     // Charcoal Surface
        text: '#FFFFFF',
        textOnPrimary: '#000000',
        accent: '#EAB308',      // Amber Accent
        alert: '#EF4444',       // Traffic Red
    },
    typography: {
        fontFamily: 'Inter-Regular',
        headingWeight: '800',   // Heavy bold for industrial feel
    },
    radii: {
        base: 8,
        button: 12,
        card: 20,
    },
    animation: {
        // High-tension transitions
        tension: 350,
        friction: 20,
    }
};

// ---------------------------------------------------------
// DOMAIN 2: KID (Soft, Reassuring, Accessible)
// ---------------------------------------------------------
export const KidTheme: DomainTheme = {
    colors: {
        primary: '#1864AB',     // Trust Blue
        background: '#E7F5FF',  // Soft Sky
        surface: '#FFFFFF',
        text: '#2B8A3E',        // Forest Green (softer than black) 
        textOnPrimary: '#FFFFFF',
        accent: '#FAB005',      // Warm Yellow
        alert: '#FA5252',       // Prominent but softer red
    },
    typography: {
        fontFamily: 'Nunito-Regular',
        headingWeight: '800',   // Chunkier, friendlier text
    },
    radii: {
        base: 12,
        button: 100,            // Pill-shaped buttons
        card: 24,               // Very soft corners
    },
    animation: {
        // Bouncy, springy transitions to ease panic
        tension: 180,
        friction: 12,
    }
};

// ---------------------------------------------------------
// DOMAIN 3: PET (Playful, Warm, Approchable)
// ---------------------------------------------------------
export const PetTheme: DomainTheme = {
    colors: {
        primary: '#E85D04',     // Energetic Orange
        background: '#FFFCF2',  // Bone White
        surface: '#FFFFFF',
        text: '#432818',        // Espresso Brown (replaces harsh black)
        textOnPrimary: '#FFFFFF',
        accent: '#9D0208',      // Deep Red
        alert: '#D00000',
    },
    typography: {
        fontFamily: 'Quicksand-Regular',
        headingWeight: '600',
    },
    radii: {
        base: 16,               // Rounded but structured
        button: 16,
        card: 16,
    },
    animation: {
        // Delightful, moderately bouncy
        tension: 220,
        friction: 18,
    }
};
