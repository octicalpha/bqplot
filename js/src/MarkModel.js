/* Copyright 2015 Bloomberg Finance L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var widgets = require("@jupyter-widgets/base");
var d3 = require("d3");
var _ = require("underscore");
var basemodel = require("./BaseModel");
var semver_range = "^" + require("../package.json").version;

var MarkModel = basemodel.BaseModel.extend({

    defaults: function() {
        return _.extend(basemodel.BaseModel.prototype.defaults(), {
            _model_name: "MarkModel",
            _model_module: "bqplot",
            _view_module: "bqplot",
            _model_module_version: semver_range,
            _view_module_version: semver_range,

            scales: {},
            scales_metadata: {},
            preserve_domain: {},
            display_legend: true,
            labels: [],
            apply_clip: true,
            visible: true,
            selected_style: {},
            unselected_style: {},
            selected: null,
            enable_hover: true,
            tooltip: null,
            tooltip_style: { opacity: 0.9 },
            interactions: { hover: "tooltip" },
            tooltip_location: "mouse"
        });
    },

    // These two attributes are the pixel values which should be appended
    // to the area of the plot to make sure that the entire mark is visible
    initialize: function() {
        MarkModel.__super__.initialize.apply(this, arguments);
        this.on("change:scales", this.update_scales, this);
        this.once("destroy", this.handle_destroy, this);
        // `this.dirty` is set to `true` before starting computations that
        // might lead the state of the model to be temporarily inconsistent.
        // certain functions of views on that model might check the value
        // of `this.dirty` before rendering
        this.dirty = false;
        this.display_el_classes = ["mark"]; //classes on the element which
        //trigger the tooltip to be displayed when they are hovered over
        this.update_scales();
    },

    update_data : function() {
        // Update_data is typically overloaded in each mark
        // it triggers the "data_updated" event
        this.update_domains();
        this.trigger("data_updated");
    },

    update_domains: function() {
        // update_domains is typically overloaded in each mark to update
        // the domains related to its scales
    },

    update_scales: function() {
        this.unregister_all_scales(this.previous("scales"));
        this.trigger("scales_updated");
        this.update_domains();
    },

    unregister_all_scales: function(scales) {
        // disassociates the mark with the scale
        this.dirty = true;
        for (var key in scales) {
            scales[key].del_domain([], this.model_id + "_" + key);
        }
        this.dirty = false;
        //TODO: Check if the views are being removed
    },

    handle_destroy: function() {
        this.unregister_all_scales(this.get("scales"));
    },

    get_key_for_dimension: function(dimension) {
        var scales_metadata = this.get("scales_metadata");
        for (var scale in scales_metadata) {
            if(scales_metadata[scale].dimension === dimension) {
                return scale;
            }
        }
        return null;
    },

    get_key_for_orientation: function(orientation) {
        var scales_metadata = this.get("scales_metadata");
        for (var scale in scales_metadata) {
            if(scales_metadata[scale].orientation === orientation) {
                return scale;
            }
        }
        return null;
    }

}, {
    serializers: _.extend({
        scales: { deserialize: widgets.unpack_models },
        tooltip: { deserialize: widgets.unpack_models }
    }, basemodel.BaseModel.serializers)
});

module.exports = {
    MarkModel: MarkModel
};
