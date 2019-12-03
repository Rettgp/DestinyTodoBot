import ColorCode from '../utility/Color.js';
import Vendor from '../vendors/VendorInfo.js';

module.exports = {
    name: 'vendor',
    description: 'Gets the current vendor items',
    async execute(message, args, keyv)
    {
        const info_message = {
            embed: {
                title: "",
                fields: [],
                color: ColorCode.DEFAULT,
            }
        };

        if (args.length < 1)
        {
            let vendor_info = new Vendor(message);
            vendor_info.VendorNone();
            return;
        }

        if (args.length === 1)
        {
            let vendor_info = new Vendor(message,args[0].toUpperCase());
            vendor_info.VendorQuery();
        }

        return;
    },
};