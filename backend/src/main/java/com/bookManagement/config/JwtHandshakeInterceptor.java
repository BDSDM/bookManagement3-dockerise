package com.bookManagement.config;

import com.bookManagement.jwt.JwtUtil;
import com.bookManagement.jwt.CustomerUsersDetailsService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;
    private final CustomerUsersDetailsService userDetailsService;

    public JwtHandshakeInterceptor(JwtUtil jwtUtil,
                                   CustomerUsersDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {

            HttpServletRequest httpRequest = servletRequest.getServletRequest();

            // ⭐ GET TOKEN FROM URL
            String token = httpRequest.getParameter("token");

            if (token != null) {

                try {

                    String email = jwtUtil.extractUsername(token);

                    if (jwtUtil.validateToken(token)) {

                        attributes.put("email", email);

                        System.out.println("WebSocket authenticated user: " + email);

                        return true;
                    }

                } catch (Exception e) {
                    System.out.println("WebSocket JWT error: " + e.getMessage());
                }
            }
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }
}