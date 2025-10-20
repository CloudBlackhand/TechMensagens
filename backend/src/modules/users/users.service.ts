import { db } from '../../config/database';
import { AuthService } from '../auth/auth.service';
import { User } from '@msgsystec/shared';

export class UsersService {
  private authService = new AuthService();

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'user';
  }): Promise<Omit<User, 'password'>> {
    const { email, password, name, role = 'user' } = userData;

    // Validar senha
    await this.authService.validatePassword(password);

    // Verificar se email já existe
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await this.authService.hashPassword(password);

    // Criar usuário
    const result = await db.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, created_at, updated_at`,
      [email, hashedPassword, name, role]
    );

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const result = await db.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return result.rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const result = await db.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async updateUser(id: string, updates: {
    name?: string;
    role?: 'admin' | 'user';
  }): Promise<Omit<User, 'password'>> {
    const { name, role } = updates;
    
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      setClause.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (role !== undefined) {
      setClause.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (setClause.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE users SET ${setClause.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, email, name, role, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Usuário não encontrado');
    }
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    // Validar nova senha
    await this.authService.validatePassword(newPassword);

    // Hash da nova senha
    const hashedPassword = await this.authService.hashPassword(newPassword);

    // Atualizar senha
    const result = await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    if (result.rowCount === 0) {
      throw new Error('Usuário não encontrado');
    }
  }
}
