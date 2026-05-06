import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for POST /auth/login
 * Validates login input before it reaches the service layer.
 */
export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
}
