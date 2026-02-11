<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $items = \App\Models\OrderItem::whereNull('item_name')->with('itemType')->get();
        foreach ($items as $item) {
            if ($item->itemType) {
                $item->update(['item_name' => $item->itemType->name]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
