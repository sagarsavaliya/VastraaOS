<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Default master data that will be created for each new tenant
     */

    public static function getDefaultItemTypes(): array
    {
        return [
            ['name' => 'Gown', 'name_gujarati' => 'ગાઉન', 'name_hindi' => 'गाउन', 'hsn_code' => '6204', 'gst_rate' => 12.00, 'display_order' => 1],
            ['name' => 'Lehenga', 'name_gujarati' => 'લહેંગો', 'name_hindi' => 'लहंगा', 'hsn_code' => '6204', 'gst_rate' => 12.00, 'display_order' => 2],
            ['name' => 'Chaniya Choli', 'name_gujarati' => 'ચણિયા ચોલી', 'name_hindi' => 'चनिया चोली', 'hsn_code' => '6204', 'gst_rate' => 12.00, 'display_order' => 3],
            ['name' => 'Blouse', 'name_gujarati' => 'બ્લાઉઝ', 'name_hindi' => 'ब्लाउज', 'hsn_code' => '6206', 'gst_rate' => 12.00, 'display_order' => 4],
            ['name' => 'Kurti', 'name_gujarati' => 'કુર્તી', 'name_hindi' => 'कुर्ती', 'hsn_code' => '6206', 'gst_rate' => 12.00, 'display_order' => 5],
            ['name' => 'Saree Blouse', 'name_gujarati' => 'સાડી બ્લાઉઝ', 'name_hindi' => 'साड़ी ब्लाउज', 'hsn_code' => '6206', 'gst_rate' => 12.00, 'display_order' => 6],
            ['name' => 'Anarkali', 'name_gujarati' => 'અનારકલી', 'name_hindi' => 'अनारकली', 'hsn_code' => '6204', 'gst_rate' => 12.00, 'display_order' => 7],
            ['name' => 'Sharara', 'name_gujarati' => 'શરારા', 'name_hindi' => 'शरारा', 'hsn_code' => '6204', 'gst_rate' => 12.00, 'display_order' => 8],
            ['name' => 'Palazzo', 'name_gujarati' => 'પલાઝો', 'name_hindi' => 'पलाज़ो', 'hsn_code' => '6204', 'gst_rate' => 12.00, 'display_order' => 9],
            ['name' => 'Dupatta', 'name_gujarati' => 'દુપટ્ટો', 'name_hindi' => 'दुपट्टा', 'hsn_code' => '6214', 'gst_rate' => 12.00, 'display_order' => 10],
            ['name' => 'Crop Top', 'name_gujarati' => 'ક્રોપ ટોપ', 'name_hindi' => 'क्रॉप टॉप', 'hsn_code' => '6206', 'gst_rate' => 12.00, 'display_order' => 11],
            ['name' => 'Jacket', 'name_gujarati' => 'જેકેટ', 'name_hindi' => 'जैकेट', 'hsn_code' => '6202', 'gst_rate' => 12.00, 'display_order' => 12],
        ];
    }

    public static function getDefaultWorkTypes(): array
    {
        return [
            ['name' => 'Jardoshi', 'name_gujarati' => 'જરદોશી', 'name_hindi' => 'जरदोशी', 'display_order' => 1],
            ['name' => 'Moti Work', 'name_gujarati' => 'મોતી વર્ક', 'name_hindi' => 'मोती वर्क', 'display_order' => 2],
            ['name' => 'Kutchi Work', 'name_gujarati' => 'કચ્છી વર્ક', 'name_hindi' => 'कच्छी वर्क', 'display_order' => 3],
            ['name' => 'Mirror Work', 'name_gujarati' => 'અભલા વર્ક', 'name_hindi' => 'शीशा वर्क', 'display_order' => 4],
            ['name' => 'Thread Work', 'name_gujarati' => 'દોરા વર્ક', 'name_hindi' => 'धागा वर्क', 'display_order' => 5],
            ['name' => 'Sequin Work', 'name_gujarati' => 'સિક્વિન વર્ક', 'name_hindi' => 'सिक्विन वर्क', 'display_order' => 6],
            ['name' => 'Stone Work', 'name_gujarati' => 'સ્ટોન વર્ક', 'name_hindi' => 'स्टोन वर्क', 'display_order' => 7],
            ['name' => 'Gota Patti', 'name_gujarati' => 'ગોટા પટ્ટી', 'name_hindi' => 'गोटा पट्टी', 'display_order' => 8],
            ['name' => 'Aari Work', 'name_gujarati' => 'આરી વર્ક', 'name_hindi' => 'आरी वर्क', 'display_order' => 9],
            ['name' => 'Machine Embroidery', 'name_gujarati' => 'મશીન એમ્બ્રોઇડરી', 'name_hindi' => 'मशीन कढ़ाई', 'display_order' => 10],
            ['name' => 'Hand Embroidery', 'name_gujarati' => 'હાથ ભરત', 'name_hindi' => 'हाथ कढ़ाई', 'display_order' => 11],
            ['name' => 'Zardozi', 'name_gujarati' => 'ઝરદોઝી', 'name_hindi' => 'ज़रदोज़ी', 'display_order' => 12],
        ];
    }

    public static function getDefaultEmbellishmentZones(): array
    {
        return [
            ['name' => 'Front Neck', 'name_gujarati' => 'આગળ ગળા', 'name_hindi' => 'आगे गला', 'display_order' => 1],
            ['name' => 'Back Neck', 'name_gujarati' => 'પાછળ ગળા', 'name_hindi' => 'पीछे गला', 'display_order' => 2],
            ['name' => 'Sleeves', 'name_gujarati' => 'બાંય', 'name_hindi' => 'आस्तीन', 'display_order' => 3],
            ['name' => 'Border/Hem', 'name_gujarati' => 'બોર્ડર/કિનારી', 'name_hindi' => 'बॉर्डर/किनारी', 'display_order' => 4],
            ['name' => 'Full Body', 'name_gujarati' => 'આખું', 'name_hindi' => 'पूरा', 'display_order' => 5],
            ['name' => 'Waist Area', 'name_gujarati' => 'કમર', 'name_hindi' => 'कमर', 'display_order' => 6],
            ['name' => 'Dupatta Border', 'name_gujarati' => 'દુપટ્ટા બોર્ડર', 'name_hindi' => 'दुपट्टा बॉर्डर', 'display_order' => 7],
            ['name' => 'Dupatta Pallu', 'name_gujarati' => 'દુપટ્ટા પલ્લુ', 'name_hindi' => 'दुपट्टा पल्लू', 'display_order' => 8],
            ['name' => 'Lehenga Border', 'name_gujarati' => 'લહેંગો બોર્ડર', 'name_hindi' => 'लहंगा बॉर्डर', 'display_order' => 9],
            ['name' => 'Lehenga Body', 'name_gujarati' => 'લહેંગો બોડી', 'name_hindi' => 'लहंगा बॉडी', 'display_order' => 10],
        ];
    }

    public static function getDefaultInquirySources(): array
    {
        return [
            ['name' => 'Walk-in', 'name_gujarati' => 'દુકાન મુલાકાત', 'name_hindi' => 'दुकान विजिट', 'icon' => 'store', 'display_order' => 1],
            ['name' => 'Phone Call', 'name_gujarati' => 'ફોન કોલ', 'name_hindi' => 'फोन कॉल', 'icon' => 'phone', 'display_order' => 2],
            ['name' => 'WhatsApp', 'name_gujarati' => 'વોટ્સએપ', 'name_hindi' => 'व्हाट्सएप', 'icon' => 'message-circle', 'display_order' => 3],
            ['name' => 'Instagram', 'name_gujarati' => 'ઇન્સ્ટાગ્રામ', 'name_hindi' => 'इंस्टाग्राम', 'icon' => 'instagram', 'display_order' => 4],
            ['name' => 'Facebook', 'name_gujarati' => 'ફેસબુક', 'name_hindi' => 'फेसबुक', 'icon' => 'facebook', 'display_order' => 5],
            ['name' => 'Referral', 'name_gujarati' => 'રેફરલ', 'name_hindi' => 'रेफरल', 'icon' => 'users', 'display_order' => 6],
            ['name' => 'Website', 'name_gujarati' => 'વેબસાઇટ', 'name_hindi' => 'वेबसाइट', 'icon' => 'globe', 'display_order' => 7],
            ['name' => 'Exhibition', 'name_gujarati' => 'એક્ઝિબિશન', 'name_hindi' => 'प्रदर्शनी', 'icon' => 'calendar', 'display_order' => 8],
        ];
    }

    public static function getDefaultOccasions(): array
    {
        return [
            ['name' => 'Wedding', 'name_gujarati' => 'લગ્ન', 'name_hindi' => 'शादी', 'color' => '#e11d48', 'display_order' => 1],
            ['name' => 'Navratri', 'name_gujarati' => 'નવરાત્રી', 'name_hindi' => 'नवरात्रि', 'color' => '#f97316', 'display_order' => 2],
            ['name' => 'Diwali', 'name_gujarati' => 'દિવાળી', 'name_hindi' => 'दिवाली', 'color' => '#fbbf24', 'display_order' => 3],
            ['name' => 'Engagement', 'name_gujarati' => 'સગાઈ', 'name_hindi' => 'सगाई', 'color' => '#ec4899', 'display_order' => 4],
            ['name' => 'Reception', 'name_gujarati' => 'રિસેપ્શન', 'name_hindi' => 'रिसेप्शन', 'color' => '#8b5cf6', 'display_order' => 5],
            ['name' => 'Sangeet', 'name_gujarati' => 'સંગીત', 'name_hindi' => 'संगीत', 'color' => '#06b6d4', 'display_order' => 6],
            ['name' => 'Mehndi', 'name_gujarati' => 'મહેંદી', 'name_hindi' => 'मेहंदी', 'color' => '#22c55e', 'display_order' => 7],
            ['name' => 'Party', 'name_gujarati' => 'પાર્ટી', 'name_hindi' => 'पार्टी', 'color' => '#3b82f6', 'display_order' => 8],
            ['name' => 'Festival', 'name_gujarati' => 'તહેવાર', 'name_hindi' => 'त्योहार', 'color' => '#a855f7', 'display_order' => 9],
            ['name' => 'Birthday', 'name_gujarati' => 'જન્મદિવસ', 'name_hindi' => 'जन्मदिन', 'color' => '#f43f5e', 'display_order' => 10],
            ['name' => 'Anniversary', 'name_gujarati' => 'વર્ષગાંઠ', 'name_hindi' => 'सालगिरह', 'color' => '#14b8a6', 'display_order' => 11],
            ['name' => 'Casual', 'name_gujarati' => 'કેઝ્યુઅલ', 'name_hindi' => 'कैजुअल', 'color' => '#64748b', 'display_order' => 12],
        ];
    }

    public static function getDefaultBudgetRanges(): array
    {
        return [
            ['name' => 'Budget', 'name_gujarati' => 'બજેટ', 'name_hindi' => 'बजट', 'min_amount' => 0, 'max_amount' => 5000, 'color' => '#22c55e', 'display_order' => 1],
            ['name' => 'Standard', 'name_gujarati' => 'સ્ટાન્ડર્ડ', 'name_hindi' => 'स्टैंडर्ड', 'min_amount' => 5001, 'max_amount' => 15000, 'color' => '#3b82f6', 'display_order' => 2],
            ['name' => 'Premium', 'name_gujarati' => 'પ્રીમિયમ', 'name_hindi' => 'प्रीमियम', 'min_amount' => 15001, 'max_amount' => 35000, 'color' => '#8b5cf6', 'display_order' => 3],
            ['name' => 'Luxury', 'name_gujarati' => 'લક્ઝરી', 'name_hindi' => 'लक्ज़री', 'min_amount' => 35001, 'max_amount' => 75000, 'color' => '#f59e0b', 'display_order' => 4],
            ['name' => 'Designer', 'name_gujarati' => 'ડિઝાઈનર', 'name_hindi' => 'डिज़ाइनर', 'min_amount' => 75001, 'max_amount' => null, 'color' => '#e11d48', 'display_order' => 5],
        ];
    }

    public static function getDefaultMeasurementTypes(): array
    {
        return [
            // Upper body measurements
            ['name' => 'Bust', 'name_gujarati' => 'છાતી', 'name_hindi' => 'छाती', 'code' => 'BUST', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 28, 'max_value' => 60, 'is_required' => true, 'display_order' => 1],
            ['name' => 'Waist', 'name_gujarati' => 'કમર', 'name_hindi' => 'कमर', 'code' => 'WAIST', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 22, 'max_value' => 55, 'is_required' => true, 'display_order' => 2],
            ['name' => 'Shoulder', 'name_gujarati' => 'ખભા', 'name_hindi' => 'कंधा', 'code' => 'SHOULDER', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 12, 'max_value' => 22, 'is_required' => true, 'display_order' => 3],
            ['name' => 'Arm Length', 'name_gujarati' => 'હાથ લંબાઈ', 'name_hindi' => 'बांह लंबाई', 'code' => 'ARM_LENGTH', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 18, 'max_value' => 28, 'is_required' => false, 'display_order' => 4],
            ['name' => 'Arm Hole', 'name_gujarati' => 'આર્મ હોલ', 'name_hindi' => 'आर्म होल', 'code' => 'ARM_HOLE', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 14, 'max_value' => 24, 'is_required' => false, 'display_order' => 5],
            ['name' => 'Upper Arm', 'name_gujarati' => 'ઉપલો હાથ', 'name_hindi' => 'ऊपरी बाजू', 'code' => 'UPPER_ARM', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 9, 'max_value' => 20, 'is_required' => false, 'display_order' => 6],
            ['name' => 'Front Neck Depth', 'name_gujarati' => 'આગળ ગળા ઊંડાઈ', 'name_hindi' => 'आगे गला गहराई', 'code' => 'FRONT_NECK', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 4, 'max_value' => 12, 'is_required' => false, 'display_order' => 7],
            ['name' => 'Back Neck Depth', 'name_gujarati' => 'પાછળ ગળા ઊંડાઈ', 'name_hindi' => 'पीछे गला गहराई', 'code' => 'BACK_NECK', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 4, 'max_value' => 14, 'is_required' => false, 'display_order' => 8],
            ['name' => 'Blouse Length', 'name_gujarati' => 'બ્લાઉઝ લંબાઈ', 'name_hindi' => 'ब्लाउज लंबाई', 'code' => 'BLOUSE_LENGTH', 'body_section' => 'upper', 'unit' => 'inches', 'min_value' => 12, 'max_value' => 24, 'is_required' => false, 'display_order' => 9],

            // Lower body measurements
            ['name' => 'Hip', 'name_gujarati' => 'હિપ', 'name_hindi' => 'हिप', 'code' => 'HIP', 'body_section' => 'lower', 'unit' => 'inches', 'min_value' => 32, 'max_value' => 65, 'is_required' => true, 'display_order' => 10],
            ['name' => 'Length (Floor)', 'name_gujarati' => 'લંબાઈ (ફ્લોર)', 'name_hindi' => 'लंबाई (फ्लोर)', 'code' => 'LENGTH_FLOOR', 'body_section' => 'lower', 'unit' => 'inches', 'min_value' => 36, 'max_value' => 48, 'is_required' => true, 'display_order' => 11],
            ['name' => 'Length (Knee)', 'name_gujarati' => 'લંબાઈ (ઘૂંટણ)', 'name_hindi' => 'लंबाई (घुटना)', 'code' => 'LENGTH_KNEE', 'body_section' => 'lower', 'unit' => 'inches', 'min_value' => 20, 'max_value' => 32, 'is_required' => false, 'display_order' => 12],
            ['name' => 'Thigh', 'name_gujarati' => 'સાથળ', 'name_hindi' => 'जांघ', 'code' => 'THIGH', 'body_section' => 'lower', 'unit' => 'inches', 'min_value' => 18, 'max_value' => 35, 'is_required' => false, 'display_order' => 13],
            ['name' => 'Inseam', 'name_gujarati' => 'ઇનસીમ', 'name_hindi' => 'इनसीम', 'code' => 'INSEAM', 'body_section' => 'lower', 'unit' => 'inches', 'min_value' => 26, 'max_value' => 38, 'is_required' => false, 'display_order' => 14],

            // Full body measurements
            ['name' => 'Height', 'name_gujarati' => 'ઊંચાઈ', 'name_hindi' => 'ऊंचाई', 'code' => 'HEIGHT', 'body_section' => 'full', 'unit' => 'cm', 'min_value' => 140, 'max_value' => 200, 'is_required' => false, 'display_order' => 15],
            ['name' => 'Weight', 'name_gujarati' => 'વજન', 'name_hindi' => 'वज़न', 'code' => 'WEIGHT', 'body_section' => 'full', 'unit' => 'kg', 'min_value' => 35, 'max_value' => 150, 'is_required' => false, 'display_order' => 16],
        ];
    }

    public static function getDefaultOrderStatuses(): array
    {
        return [
            ['name' => 'Draft', 'name_gujarati' => 'ડ્રાફ્ટ', 'name_hindi' => 'ड्राफ्ट', 'code' => 'DRAFT', 'color' => '#94a3b8', 'icon' => 'file-edit', 'is_default' => true, 'is_final' => false, 'display_order' => 1],
            ['name' => 'Confirmed', 'name_gujarati' => 'કન્ફર્મ', 'name_hindi' => 'कन्फर्म', 'code' => 'CONFIRMED', 'color' => '#3b82f6', 'icon' => 'check-circle', 'is_default' => false, 'is_final' => false, 'display_order' => 2],
            ['name' => 'In Progress', 'name_gujarati' => 'કામ ચાલુ', 'name_hindi' => 'काम जारी', 'code' => 'IN_PROGRESS', 'color' => '#f59e0b', 'icon' => 'loader', 'is_default' => false, 'is_final' => false, 'display_order' => 3],
            ['name' => 'Ready', 'name_gujarati' => 'તૈયાર', 'name_hindi' => 'तैयार', 'code' => 'READY', 'color' => '#8b5cf6', 'icon' => 'package', 'is_default' => false, 'is_final' => false, 'display_order' => 4],
            ['name' => 'Delivered', 'name_gujarati' => 'ડિલિવર', 'name_hindi' => 'डिलीवर', 'code' => 'DELIVERED', 'color' => '#22c55e', 'icon' => 'truck', 'is_default' => false, 'is_final' => true, 'display_order' => 5],
            ['name' => 'Cancelled', 'name_gujarati' => 'રદ', 'name_hindi' => 'रद्द', 'code' => 'CANCELLED', 'color' => '#ef4444', 'icon' => 'x-circle', 'is_default' => false, 'is_final' => true, 'display_order' => 6],
        ];
    }

    public static function getDefaultOrderPriorities(): array
    {
        return [
            ['name' => 'Normal', 'name_gujarati' => 'સામાન્ય', 'name_hindi' => 'सामान्य', 'code' => 'NORMAL', 'color' => '#64748b', 'surcharge_percentage' => 0, 'priority_level' => 1, 'days_reduction' => 0, 'is_default' => true, 'display_order' => 1],
            ['name' => 'Urgent', 'name_gujarati' => 'તાકીદનું', 'name_hindi' => 'जरूरी', 'code' => 'URGENT', 'color' => '#f59e0b', 'surcharge_percentage' => 15, 'priority_level' => 2, 'days_reduction' => 3, 'is_default' => false, 'display_order' => 2],
            ['name' => 'Rush', 'name_gujarati' => 'રશ', 'name_hindi' => 'जल्दी', 'code' => 'RUSH', 'color' => '#ef4444', 'surcharge_percentage' => 30, 'priority_level' => 3, 'days_reduction' => 7, 'is_default' => false, 'display_order' => 3],
            ['name' => 'VIP', 'name_gujarati' => 'VIP', 'name_hindi' => 'VIP', 'code' => 'VIP', 'color' => '#8b5cf6', 'surcharge_percentage' => 50, 'priority_level' => 4, 'days_reduction' => 10, 'is_default' => false, 'display_order' => 4],
        ];
    }

    public function run(): void
    {
        // This seeder doesn't insert data directly
        // It provides default data methods for TenantService to use
        // when creating new tenants
    }
}
