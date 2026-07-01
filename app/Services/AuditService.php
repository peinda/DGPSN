<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public static function log(
        string  $action,
        string  $description,
        ?Model  $model       = null,
        ?array  $avant       = null,
        ?array  $apres       = null,
    ): void {
        AuditLog::create([
            'user_id'      => Auth::id(),
            'action'       => $action,
            'model_type'   => $model ? get_class($model) : null,
            'model_id'     => $model?->getKey(),
            'description'  => $description,
            'donnees_avant'=> $avant,
            'donnees_apres'=> $apres,
            'ip_address'   => Request::ip(),
            'user_agent'   => substr(Request::userAgent() ?? '', 0, 500),
        ]);
    }

    public static function demande(string $action, Model $demande, string $description): void
    {
        static::log($action, $description, $demande);
    }
}
