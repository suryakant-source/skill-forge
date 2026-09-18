package com.skillforge.backend.dto.response;

import com.skillforge.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload returned after successful user registration or login.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private String name;
    private String email;
    private Role role;
    private Long userId;
}