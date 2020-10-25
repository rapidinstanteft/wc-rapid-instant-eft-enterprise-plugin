jQuery( function( $ ) {
	'use strict';

    window.eftPaymentKey = null;

    window.wc_checkout_form = {
        submit_error: function(error_message) {
            var $checkout_form = jQuery('form.checkout');
            jQuery('.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message').remove();
            $checkout_form.prepend('<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout">' + error_message + '</div>');
            $checkout_form.removeClass('processing').unblock();
            $checkout_form.find('.input-text, select, input:checkbox').blur();
            jQuery('html, body').animate({
                scrollTop: (jQuery('form.checkout').offset().top - 100)
            }, 1000);
            jQuery(document.body).trigger('checkout_error');
        }
    };

	var wc_rapidinstantcheckout_form = {
		init: function( form ) {
			//Check for service url override
			if (typeof wc_rapidinstantcheckout_params.service_url != 'undefined' ) {
                eftSec.checkout.settings.serviceUrl = wc_rapidinstantcheckout_params.service_url;
			}
			else {
                eftSec.checkout.settings.serviceUrl = "https://secure.rapidinstanteft.co.za/eft";
			}

			this.form          = form;
			this.rapidinstantcheckout_submit = false;

			$( this.form )
				.on( 'click', '#place_order', this.onSubmit )
				.on( 'submit checkout_place_order_rapidinstantcheckout' );

			$( document.body ).on( 'checkout_error', this.resetModal );
		},

        validates: function() {

            var $required_inputs;

            if ( $( 'input#terms' ).length === 1 && $( 'input#terms:checked' ).length === 0 ) {
                return false;
            }

            if ( $( '#createaccount' ).is( ':checked' ) && $( '#account_password' ).length && $( '#account_password' ).val() === '' ) {
                return false;
            }

            // check to see if we need to validate shipping address
            if ( $( '#ship-to-different-address-checkbox' ).is( ':checked' ) ) {
                $required_inputs = $( '.woocommerce-billing-fields .validate-required, .woocommerce-shipping-fields .validate-required' );
            } else {
                $required_inputs = $( '.woocommerce-billing-fields .validate-required' );
            }

            if ( $required_inputs.length ) {
                var required_error = false;

                $required_inputs.each( function() {
                    if ( $( this ).find( 'input.input-text, select' ).not( $( '#account_password, #account_username' ) ).val() === '' ) {
                        required_error = true;
                    }
                });

                if ( required_error ) {
                    return false;
                }
            }

            return true;
        },

		isEftsecureChosen: function() {
			return $( '#payment_method_rapidinstantcheckout' ).is( ':checked' );
		},

		isEftsecureModalNeeded: function( e ) {
			// Don't affect submit if modal is not needed.
			if (!wc_rapidinstantcheckout_form.isEftsecureChosen() || !wc_rapidinstantcheckout_form.validates()) {
				return false;
			}
            // Don't affect submit if payment already complete.
			if (wc_rapidinstantcheckout_form.rapidinstantcheckout_submit) {
				return false;
			}
			return true;
		},

		block: function() {
			wc_rapidinstantcheckout_form.form.block({
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			});
		},

		unblock: function() {
			wc_rapidinstantcheckout_form.form.unblock();
		},

		onClose: function() {
			wc_rapidinstantcheckout_form.unblock();
		},

		onSubmit: function( e ) {

			if ( wc_rapidinstantcheckout_form.isEftsecureModalNeeded()) {
				var $data = jQuery('#rapidinstantcheckout-payment-data');
				e.preventDefault();

				if (window.eftPaymentKey != null) {
                    console.log('Initiating transaction existing transaction');
                    eftSec.checkout.init({
                        paymentKey: window.eftPaymentKey,
                        onLoad: function () {
                            wc_rapidinstantcheckout_form.unblock();
                        },
                        onComplete: function (data) {
                            console.log('onComplete', data);
                            console.log('form', wc_rapidinstantcheckout_form);
                            try {
                                eftSec.checkout.hideFrame();
                            }
                            catch (e) {
                                console.log(e);
                            }
                            wc_rapidinstantcheckout_form.rapidinstantcheckout_submit = true;
                            var $form = wc_rapidinstantcheckout_form.form;
                            if ($form.find('input.rapidinstantcheckout_transaction_id').length > 0) {
                                $form.find('input.rapidinstantcheckout_transaction_id').remove();
                            }
                            $form.append('<input type="hidden" class="rapidinstantcheckout_transaction_id" name="rapidinstantcheckout_transaction_id" value="' + data.transaction_id + '"/>');
                            $form.submit();
                        }
                    });
                }
				else {
                    jQuery.ajax({
                        type: 'POST',
                        url: wc_checkout_params.checkout_url,
                        data: jQuery('form.checkout').serialize(),
                        dataType: 'json',
                        success: function (result) {
                            try {
                                if ('success' === result.result) {
                                    window.eftPaymentKey = result.paymentKey;
                                    console.log(window.eftPaymentKey);
                                    console.log('Initiating transaction first time');
                                    eftSec.checkout.init({
                                        paymentKey: window.eftPaymentKey,
                                        onLoad: function () {
                                            wc_rapidinstantcheckout_form.unblock();
                                        },
                                        onComplete: function (data) {
                                            eftSec.checkout.hideFrame();
                                            wc_rapidinstantcheckout_form.rapidinstantcheckout_submit = true;
                                            var $form = wc_rapidinstantcheckout_form.form;
                                            if ($form.find('input.rapidinstantcheckout_transaction_id').length > 0) {
                                                $form.find('input.rapidinstantcheckout_transaction_id').remove();
                                            }
                                            $form.append('<input type="hidden" class="rapidinstantcheckout_transaction_id" name="rapidinstantcheckout_transaction_id" value="' + data.transaction_id + '"/>');
                                            $form.submit();
                                        }
                                    });

                                } else if ('failure' === result.result) {
                                    throw 'Result failure';
                                } else {
                                    throw 'Invalid response';
                                }
                            } catch (err) {
                                // Reload page
                                if (true === result.reload) {
                                    window.location.reload();
                                    return;
                                }

                                // Trigger update in case we need a fresh nonce
                                if (true === result.refresh) {
                                    jQuery(document.body).trigger('update_checkout');
                                }

                                // Add new errors
                                if (result.messages) {
                                    window.wc_checkout_form.submit_error(result.messages);
                                } else {
                                    window.wc_checkout_form.submit_error('<div class="woocommerce-error">' + wc_checkout_params.i18n_checkout_error + '</div>');
                                }
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            wc_checkout_form.submit_error('<div class="woocommerce-error">' + errorThrown + '</div>');
                        }
                    });
                }

				wc_rapidinstantcheckout_form.block();


				return false;
			}

			return true;
		},

		resetModal: function() {
			if (wc_rapidinstantcheckout_form.form.find( 'input.rapidinstantcheckout_transaction_id' ).length > 0) {
                wc_rapidinstantcheckout_form.form.find('input.rapidinstantcheckout_transaction_id').remove();
            }
			wc_rapidinstantcheckout_form.rapidinstantcheckout_submit = false;
		}
	};

	wc_rapidinstantcheckout_form.init( $( "form.checkout, form#order_review, form#add_payment_method" ) );
} );
