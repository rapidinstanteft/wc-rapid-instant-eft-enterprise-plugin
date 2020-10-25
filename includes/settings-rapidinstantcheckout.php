<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return apply_filters( 'wc_rapidinstantcheckout_settings',
	array(
		'enabled' => array(
			'title'       => __( 'Enable/Disable', 'woocommerce-rapid-instant-checkout' ),
			'label'       => __( 'Enable Rapid Instant EFT Enterprise', 'woocommerce-rapid-instant-checkout' ),
			'type'        => 'checkbox',
			'description' => '',
			'default'     => 'no'
		),
		'title' => array(
			'title'       => __( 'Title', 'woocommerce-rapid-instant-checkout' ),
			'type'        => 'text',
			'description' => __( 'This allows Instant EFT Payments through checkout.', 'woocommerce-rapid-instant-checkout' ),
			'default'     => __( 'Rapid Instant EFT Checkout', 'woocommerce-rapid-instant-checkout' ),
			'desc_tip'    => true,
		),
		'description' => array(
			'title'       => __( 'Description', 'woocommerce-rapid-instant-checkout' ),
			'type'        => 'text',
			'description' => __( 'This controls the description which the user sees during checkout.', 'woocommerce-rapid-instant-checkout' ),
			'default'     => __( 'Pay using your internet banking login.', 'woocommerce-rapid-instant-checkout'),
			'desc_tip'    => true,
		),
		'username' => array(
			'title'       => __( 'API Username', 'woocommerce-rapid-instant-checkout' ),
			'type'        => 'text',
			'description' => __( 'Get your API username from your Rapid Payment account.', 'woocommerce-rapid-instant-checkout' ),
			'default'     => '',
			'desc_tip'    => true,
		),
        'password' => array(
            'title'       => __( 'API Password', 'woocommerce-rapid-instant-checkout' ),
            'type'        => 'password',
            'description' => __( 'Get your API password from your Rapid Payment account.', 'woocommerce-rapid-instant-checkout' ),
            'default'     => '',
            'desc_tip'    => true,
        ),
		'logging' => array(
			'title'       => __( 'Logging', 'woocommerce-rapid-instant-checkout' ),
			'label'       => __( 'Log debug messages', 'woocommerce-rapid-instant-checkout' ),
			'type'        => 'checkbox',
			'description' => __( 'Save debug messages to the WooCommerce System Status log.', 'woocommerce-rapid-instant-checkout' ),
			'default'     => 'no',
			'desc_tip'    => true,
		),
	)
);
