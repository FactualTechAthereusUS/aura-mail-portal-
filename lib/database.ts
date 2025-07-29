import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Database configuration for Vercel deployment connecting to Digital Ocean
const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'mailuser',
  password: process.env.MYSQL_PASSWORD || 'StrongMailPassword123!',
  database: process.env.MYSQL_DATABASE || 'mailserver',
  charset: 'utf8mb4',
  // Connection pool settings for production
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined
};

// Create connection pool
export const db = mysql.createPool(dbConfig);

// Domain configuration from environment variables
export const DOMAIN = process.env.DOMAIN || 'aurafarming.co';
export const MAIL_DOMAIN = process.env.MAIL_DOMAIN || 'mail.aurafarming.co';
export const PORTAL_DOMAIN = process.env.PORTAL_DOMAIN || 'portal.aurafarming.co';

// User management functions that integrate with existing backend
export class UserManager {
  
  // Check if username is available
  static async isUsernameAvailable(username: string): Promise<boolean> {
    const email = `${username}@${DOMAIN}`;
    
    try {
      const [rows] = await db.execute(
        'SELECT id FROM virtual_users WHERE email = ?',
        [email]
      );
      
      return Array.isArray(rows) && rows.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw new Error('Database error');
    }
  }

  // Get domain ID (should always be 1 for aurafarming.co)
  static async getDomainId(): Promise<number> {
    try {
      const [rows] = await db.execute(
        'SELECT id FROM virtual_domains WHERE name = ?',
        [DOMAIN]
      );
      
      if (Array.isArray(rows) && rows.length > 0) {
        return (rows[0] as any).id;
      } else {
        throw new Error('Domain not found in database');
      }
    } catch (error) {
      console.error('Error getting domain ID:', error);
      throw new Error('Database error');
    }
  }

  // Create new user account
  static async createUser(userData: {
    username: string;
    password: string;
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    country?: string;
  }): Promise<{ success: boolean; email: string; message: string }> {
    
    const { username, password, fullName, dateOfBirth, gender, country } = userData;
    const email = `${username}@${DOMAIN}`;

    try {
      // Check if username is available
      const isAvailable = await this.isUsernameAvailable(username);
      if (!isAvailable) {
        return {
          success: false,
          email: '',
          message: 'Username already taken'
        };
      }

      // Get domain ID
      const domainId = await this.getDomainId();

      // Hash password using bcrypt (Vercel doesn't have doveadm)
      const hashedPassword = await this.hashPassword(password);

      // Insert user into database
      await db.execute(
        'INSERT INTO virtual_users (domain_id, email, password) VALUES (?, ?, ?)',
        [domainId, email, hashedPassword]
      );

      // Trigger mailbox creation via API call to Digital Ocean backend
      await this.createMailboxViaAPI(email);

      // Log the user creation (including all user details for admin records)
      const userDetails = [
        fullName,
        dateOfBirth ? `DOB: ${dateOfBirth}` : '',
        gender ? `Gender: ${gender}` : '',
        country ? `Country: ${country}` : ''
      ].filter(Boolean).join(', ');
      
      console.log(`✅ User created: ${email} (${userDetails})`);

      return {
        success: true,
        email: email,
        message: 'Account created successfully'
      };

    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        email: '',
        message: 'Failed to create account. Please try again.'
      };
    }
  }

  // Hash password using bcrypt (compatible with Vercel serverless)
  private static async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Create mailbox via API call to Digital Ocean backend
  private static async createMailboxViaAPI(email: string): Promise<void> {
    try {

      const backendHost = process.env.BACKEND_HOST || process.env.MYSQL_HOST;
      
      if (!backendHost) {
        console.log('⚠️ No backend host configured, skipping mailbox creation');
        return;
      }

      // Call your Digital Ocean server's mailbox creation API
      const response = await fetch(`http://${backendHost}:3001/api/create-mailbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BACKEND_API_KEY || 'default-key'}`
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        console.log(`✅ Mailbox creation requested for: ${email}`);
      } else {
        console.log(`⚠️ Mailbox creation request failed for: ${email}`);
      }
    } catch (error) {
      console.error('Error requesting mailbox creation:', error);
      // Don't throw error - user account is already created
      console.log('⚠️ Mailbox creation will be handled manually');
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    totalUsers: number;
    recentUsers: number;
    domains: string[];
  }> {
    try {
      // Get total users
      const [totalResult] = await db.execute(
        'SELECT COUNT(*) as count FROM virtual_users'
      );
      const totalUsers = (totalResult as any)[0].count;

      // Get users created in last 7 days
      const [recentResult] = await db.execute(
        'SELECT COUNT(*) as count FROM virtual_users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );
      const recentUsers = (recentResult as any)[0]?.count || 0;

      // Get domains
      const [domainsResult] = await db.execute(
        'SELECT name FROM virtual_domains ORDER BY name'
      );
      const domains = (domainsResult as any[]).map(row => row.name);

      return {
        totalUsers,
        recentUsers,
        domains
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalUsers: 0,
        recentUsers: 0,
        domains: [DOMAIN]
      };
    }
  }

  // Validate username format
  static validateUsername(username: string): { valid: boolean; message: string } {
    // Check length
    if (username.length < 2 || username.length > 30) {
      return { valid: false, message: 'Username must be 2-30 characters long' };
    }

    // Check characters (alphanumeric, dots, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, dots, hyphens, and underscores' };
    }

    // Check it doesn't start or end with special characters
    if (username.startsWith('.') || username.startsWith('-') || username.startsWith('_') ||
        username.endsWith('.') || username.endsWith('-') || username.endsWith('_')) {
      return { valid: false, message: 'Username cannot start or end with special characters' };
    }

    // Check for reserved names
    const reserved = ['admin', 'administrator', 'root', 'postmaster', 'webmaster', 'hostmaster', 'noreply', 'no-reply'];
    if (reserved.includes(username.toLowerCase())) {
      return { valid: false, message: 'This username is reserved' };
    }

    return { valid: true, message: 'Username is valid' };
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
} 