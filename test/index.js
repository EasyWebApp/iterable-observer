import EventStream from '../source/EventStream';

import Sinon from 'sinon';


/**
 * @test {EventStream}
 */
describe('Event stream',  () => {

    const listener = Sinon.spy((next, done) => {

        var count = 0;

        const ID = setInterval(
            () => ((count++ < 4) ? next : done)( count ),  100
        );

        return  () => clearInterval( ID );
    });

    var stream;

    /**
     * @test {EventStream#constructor}
     */
    it('should\'t call the listener on constructing',  () => {

        stream = new EventStream( listener );

        listener.should.not.be.called();
    });

    /**
     * @test {EventStream#listen}
     */
    it('should listen events on iterating & async-yield them',  async () => {

        const list = [ ];

        for await (let number of stream)  list.push( number );

        listener.should.be.calledOnce();

        list.should.be.eql([1, 2, 3, 4, 5]);
    });

    /**
     * @test {EventStream#toPromise}
     */
    it('should return the final event on converting to a Promise',  () =>
        (new EventStream( listener )).toPromise().should.be.fulfilledWith( 5 )
    );

    const error = new Error('test');

    async function throwError(stream) {
        try {
            for await (let item of stream)  ;

        } catch (_error_) {  _error_.should.be.eql( error );  }
    }

    /**
     * @test {EventStream#listen}
     */
    it(
        'should throw out errors in the listener',
        ()  =>  throwError(new EventStream(() => {  throw error;  }))
    );

    /**
     * @test {EventStream#\[Symbol\.asyncIterator\]}
     */
    it(
        'should throw the error on `fail( error )` called',
        ()  =>  throwError(new EventStream((next, done, fail) => {

            setTimeout(() => fail( error ));

            return  () => { };
        }))
    );

    /**
     * @test {EventStream#listen}
     */
    it(
        'should throw out errors in the canceller',
        ()  =>  throwError(new EventStream((next, done) => {

            done('test');

            return  () => {  throw error;  };
        }))
    );
});
