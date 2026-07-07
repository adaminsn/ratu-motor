<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        // Jika request dari API, jangan redirect
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }
        
        // Untuk web, redirect ke login
        return route('login');
    }
}