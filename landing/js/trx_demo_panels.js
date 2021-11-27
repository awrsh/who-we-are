jQuery(document).ready (function () {

	// Display panels after delay
	if ( TRX_DEMO_STORAGE['tabs_delay'] > 0 && TRX_DEMO_STORAGE['tabs_layout'] != '' ) {
		setTimeout( function() {
			jQuery('body').append(TRX_DEMO_STORAGE['tabs_layout']);
			trx_demo_init();
		}, TRX_DEMO_STORAGE['tabs_delay'] );
	} else {
		trx_demo_init();
	}
} );


function trx_demo_init() {

	var $demo_panels = jQuery( '.trx_demo_panels' );

	// Switch panels on tab click
	$demo_panels.find('.trx_demo_tabs a:not([data-type="link"])')
		.on('click', function(e) {
			var tab = jQuery(this),
				panels = tab.parents('.trx_demo_panels'),
				new_panel = panels.find(tab.attr('href'));
			// Replace bg image placeholders
			if ( ! new_panel.hasClass( 'trx_demo_images_init' ) ) {
				new_panel
					.addClass( 'trx_demo_images_init' )
					.find( '[data-style^="background-image"]' )
						.each( function() {
							var $self = jQuery( this );
							$self
								.attr( 'style', $self.data('style') )
								.removeAttr( 'data-style' );

						} );
			}
			// Open panel
			if ( panels.hasClass('open') ) {
				if ( ! tab.hasClass('trx_demo_tab_active') ) {
					panels.find('.trx_demo_panel_active').fadeOut(function() {
						jQuery(this).removeClass('trx_demo_panel_active');
						new_panel.fadeIn().addClass('trx_demo_panel_active');
					});
				}
			} else {
				if ( ! tab.hasClass('trx_demo_tab_active') ) {
					panels.find('.trx_demo_panel_active').hide();
					new_panel.show().addClass('trx_demo_panel_active');
				}
				panels.addClass('open');
				jQuery('html').addClass('trx_demo_panels_open');
			}
			if ( ! tab.hasClass('trx_demo_tab_active') ) {
				tab.siblings().removeClass('trx_demo_tab_active');
				tab.addClass('trx_demo_tab_active');
			}
			e.preventDefault();
			return false;
		});

	// Close panels
	$demo_panels.find('.trx_demo_button_close,.trx_demo_panels_mask')
		.on('click', function(e) {
			$demo_panels
				.removeClass('open')
				.find('.trx_demo_panel_active').fadeOut(function() { jQuery(this).removeClass('trx_demo_panel_active'); }).end()
				.find('.trx_demo_tab_active').removeClass('trx_demo_tab_active');
			jQuery('html').removeClass('trx_demo_panels_open');
			e.preventDefault();
			return false;		
		});

	// Add classes to body
	$demo_panels.find('.trx_demo_panel_list_item[data-body-class] a')
		.on('click', function(e) {
			jQuery('body').toggleClass( jQuery(this).parents('.trx_demo_panel_list_item').data('body-class') );
			e.preventDefault();
			return false;		
		});

	// Subscribe email
	$demo_panels.find('.trx_demo_subscribe_email')
		.on('keypress', function(e) {
			jQuery(this).removeClass('trx_demo_field_error');
		} );
	$demo_panels.find('.trx_demo_subscribe_button')
		.on('click', function(e) {
			jQuery(this).parents('form').submit();
			e.preventDefault();
			return false;		
		});
	$demo_panels.find('.trx_demo_subscribe form')
		.on('submit', function(e) {
			var form = jQuery(this),
				fld = form.find('.trx_demo_subscribe_email'),
				email = fld.val(),
				url = form.attr('action'),
				nonce = form.find('[name="trx_demo_subscribe_nonce"]').val();
			var regexp = new RegExp( '^([a-z0-9_\\-]+\\.)*[a-z0-9_\\-]+@[a-z0-9_\\-]+(\\.[a-z0-9_\\-]+)*\\.[a-z]{2,6}$' );
			if ( url === '' || email === '' || email.length < 7 || ! regexp.test( email ) ) {
				fld.addClass( 'trx_demo_field_error' );
			} else {
				form.addClass('trx_demo_loading');
				jQuery.post(url, {
					action: "trx_demo_subscribe",
					nonce: nonce,
					email: email
				}).done(function(response) {
					var rez = {};
					try {
						rez = JSON.parse(response);
					} catch(e) {
						rez = { error: TRX_DEMO_STORAGE['msg_ajax_error'] };
						console.log(response);
					}
					form.removeClass('trx_demo_loading');
					var result = form.siblings(".trx_demo_message_box").removeClass("trx_demo_message_box_error").removeClass("trx_demo_message_box_success");
					if (rez.error === '') {
						form.get(0).reset();
						result.addClass("trx_demo_message_box_success").html( rez.success );
					} else {
						result.addClass("trx_demo_message_box_error").html( rez.error );
					}
					result.fadeIn().delay(5000).fadeOut();
				});
			}
			e.preventDefault();
			return false;		
		});


	// Block submit form with search field
	$demo_panels.find( '.trx_demo_panel_filters_form' )
		.on( 'submit', function() {
			return false;
		} );

	// Search items by part of slug (title)
	$demo_panels.find( '.trx_demo_panel_filters_search' )
		.on( 'keyup', function(e) {
			filter_items( jQuery( this ).parents( '.trx_demo_panel' ), false );
		} );

	// Filter items by tag
	$demo_panels.find( '.trx_demo_panel_filters_list' )
		.on( 'click', 'a', function(e) {
			jQuery( this ).parent().siblings().removeClass( 'filter_active' );
			jQuery( this ).parent().addClass( 'filter_active' );
			filter_items( jQuery( this ).parents( '.trx_demo_panel' ), true );
			e.preventDefault();
			return false;
		} );

	// Show/Hide items
	function filter_items( section, hide_all ) {
		var txt = section.find( '.trx_demo_panel_filters_search' ).val(),
			flt = section.find( '.trx_demo_panel_filters_list_item.filter_active' ).data( 'filter' ) || '',
			mh  = 0;
		if ( hide_all ) {
			//mh = section.css( 'min-height' );
			section
			//	.css( 'min-height', section.outerHeight() + 'px' )
				.find( '[data-filter-value]:visible' ).fadeOut( 300 );
		}
		setTimeout( function() {
			var once = true;
			section.find( ( flt != '' ? '[data-filter-value]' : '[data-search-value]' ) + ( hide_all ? ':hidden' : '' ) ).each( function() {
				var $self = jQuery( this ),
					flt_val = $self.data( 'filter-value' ) || '',
					search_val = $self.data( 'search-value' ) || '';
				if ( ( txt === '' || search_val.indexOf( txt ) >= 0 )
					&& ( flt == 'All' || flt == '' || flt_val.indexOf( flt ) >= 0 )
				) {
					$self.fadeIn();
					if ( hide_all && once ) {
						once = false;
						//section.css( 'min-height', mh );
					}
				} else if ( ! hide_all && $self.is( ':visible' ) ) {
					$self.fadeOut();
				}
			} );
		}, hide_all ? 330 : 0 );
	}
}