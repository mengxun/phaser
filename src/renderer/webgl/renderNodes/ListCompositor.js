/**
 * @author       Benjamin D. Richards <benjamindrichards@gmail.com>
 * @copyright    2013-2024 Phaser Studio Inc.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../../utils/Class');
var RenderNode = require('./RenderNode');

/**
 * Render a list of Game Objects.
 *
 * @class ListCompositor
 * @memberof Phaser.Renderer.WebGL.RenderNodes
 * @constructor
 * @since 3.90.0
 * @extends Phaser.Renderer.WebGL.RenderNodes.RenderNode
 * @param {Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager} manager - The manager that owns this RenderNode.
 * @param {Phaser.Renderer.WebGL.WebGLRenderer} renderer - The renderer that owns this RenderNode.
 */
var ListCompositor = new Class({
    Extends: RenderNode,

    initialize: function ListCompositor (manager, renderer)
    {
        RenderNode.call(this, 'ListCompositor', manager, renderer);
    },

    /**
     * Render each child in the display list.
     *
     * This allocates a new DisplayContext if a child's blend mode is different
     * from the previous child. This will start a new batch if one is in progress.
     *
     * @method Phaser.Renderer.WebGL.RenderNodes.ListCompositor#render
     * @since 3.90.0
     * @param {Phaser.Renderer.WebGL.DrawingContext} displayContext - The context currently in use.
     * @param {Phaser.GameObjects.GameObject[]} children - The list of children to render.
     * @param {Phaser.Cameras.Scene2D.Camera} camera - Current Camera.
     * @param {Phaser.GameObjects.Components.TransformMatrix} [parentTransformMatrix] - This transform matrix is defined if the game object is nested
     */
    run: function (displayContext, children, camera, parentTransformMatrix)
    {
        var currentContext = displayContext;
        var baseBlendMode = displayContext.blendMode;
        var currentBlendMode = baseBlendMode;

        // Render each child in the display list
        for (var i = 0; i < children.length; i++)
        {
            var child = children[i];

            if (child.blendMode !== currentBlendMode)
            {
                if (currentContext !== displayContext)
                {
                    // Only release non-base contexts.
                    currentContext.release();
                }

                currentBlendMode = child.blendMode;

                if (currentBlendMode === baseBlendMode)
                {
                    // Reset to the base context.
                    currentContext = displayContext;
                }
                else
                {
                    // Change blend mode.
                    currentContext = displayContext.getClone();
                    currentContext.setBlendMode(currentBlendMode);
                    currentContext.use();
                }
            }

            child.renderWebGL(this.renderer, currentContext, child, camera, parentTransformMatrix);
        }

        // Release any remaining context.
        if (currentContext !== displayContext)
        {
            currentContext.release();
        }
    }
});

module.exports = ListCompositor;